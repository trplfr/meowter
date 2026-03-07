import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSass } from '@rsbuild/plugin-sass'

const alias = {
  '@shared': '../shared/src',
  '@pages': './src/pages',
  '@modules': './src/modules',
  '@ui': './src/ui',
  '@logic': './src/logic',
  '@lib': './src/lib',
  '@core': './src/core',
  '@assets': './src/assets',

  // принудительно один инстанс effector (mjs) для обоих environments
  'effector': require.resolve('effector/effector.mjs'),
  'effector-react': require.resolve('effector-react/effector-react.mjs')
}

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  resolve: { alias },
  tools: {
    swc: {
      jsc: {
        experimental: {
          plugins: [['@effector/swc-plugin', {}]]
        }
      }
    }
  },
  output: {
    cssModules: {
      auto: true,
      localIdentName: '[local]--[hash:6]'
    }
  },
  environments: {
    web: {
      source: {
        entry: {
          index: './src/index.tsx'
        }
      },
      html: {
        template: './src/index.html'
      },
      output: {
        target: 'web'
      }
    },
    node: {
      source: {
        entry: {
          index: './src/server.tsx'
        }
      },
      output: {
        target: 'node',
        distPath: {
          root: 'dist/server'
        }
      }
    }
  },
  server: {
    port: 3000
  },
  dev: {
    setupMiddlewares: (middlewares, context) => {
      const { environments } = context

      // SSR middleware - перехватываем HTML-запросы до дефолтного обработчика
      middlewares.unshift(async (req, res, next) => {
        const url = req.url || '/'

        // пропускаем статику и HMR
        if (url.startsWith('/__') || url.includes('.')) {
          return next()
        }

        try {
          const bundle = await environments.node.loadBundle('index')
          const template = await environments.web.getTransformedHtml('index')

          const { html: appHtml, scopeData } = await bundle.render(url, req.headers.host)

          const html = template
            .replace(
              '</head>',
              `<script>self.__SSR_STATE__ = ${JSON.stringify(scopeData)}</script></head>`
            )
            .replace('<!--app-content-->', appHtml)

          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(html)
        } catch (err) {
          console.error('SSR render failed:', err)
          next()
        }
      })
    }
  }
})
