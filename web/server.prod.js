import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = join(__dirname, 'dist')
const serverDir = join(distDir, 'server')

// MIME-типы для статики
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json'
}

// загружаем HTML-шаблон (билд rsbuild кладет его в dist/index.html)
const template = readFileSync(join(distDir, 'index.html'), 'utf-8')

// загружаем SSR-бандл
const { render } = await import(join(serverDir, 'index.js'))

const PORT = parseInt(process.env.PORT || '3000', 10)

const serveStatic = (res, filePath) => {
  if (!existsSync(filePath)) {
    return false
  }

  const ext = extname(filePath)
  const mime = MIME_TYPES[ext] || 'application/octet-stream'
  const content = readFileSync(filePath)

  const headers = { 'Content-Type': mime }

  // кеширование для статических ассетов (js, css, шрифты, картинки)
  if (ext !== '.html') {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  }

  res.writeHead(200, headers)
  res.end(content)
  return true
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`)
  const pathname = url.pathname

  // статика из dist/ (JS, CSS, изображения, шрифты)
  if (pathname.includes('.')) {
    const filePath = join(distDir, pathname)
    if (serveStatic(res, filePath)) {
      return
    }
  }

  // все остальное = SSR
  try {
    const result = await render(
      pathname + url.search,
      req.headers.host,
      req.headers.cookie
    )

    // редирект
    if ('redirect' in result) {
      res.writeHead(302, { Location: result.redirect })
      res.end()
      return
    }

    const html = template
      .replace('lang=""', `lang="${result.locale}"`)
      .replace(
        '</head>',
        `<script>self.__SSR_STATE__ = ${JSON.stringify(result.scopeData).replace(/</g, '\\u003c')}</script></head>`
      )
      .replace('<!--app-content-->', result.html)

    res.writeHead(result.status || 200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    })
    res.end(html)
  } catch (err) {
    console.error('SSR render failed:', err)
    res.writeHead(500, { 'Content-Type': 'text/html' })
    res.end('<h1>500 Internal Server Error</h1>')
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Meowter SSR server running on :${PORT}`)
})

// graceful shutdown
const shutdown = () => {
  console.log('Shutting down SSR server...')
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 10000)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
