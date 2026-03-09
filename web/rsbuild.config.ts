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
  plugins: [
    pluginReact(),
    pluginSass({
      sassLoaderOptions: {
        additionalData: `@use '@ui/theme/variables' as *; @use '@ui/theme/mixins' as *;`
      }
    })
  ],
  resolve: { alias },
  tools: {
    swc: {
      jsc: {
        experimental: {
          plugins: [
            ['@effector/swc-plugin', {
              factories: ['@withease/factories']
            }],
            ['@lingui/swc-plugin', {}]
          ]
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
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000'
    }
  },
  dev: {
    setupMiddlewares: (middlewares, context) => {
      const { environments } = context

      // SSR middleware - перехватываем HTML-запросы до дефолтного обработчика
      middlewares.unshift(async (req, res, next) => {
        const url = req.url || '/'

        // пропускаем API, uploads, статику и HMR
        if (url.startsWith('/api') || url.startsWith('/uploads') || url.startsWith('/__') || url.includes('.')) {
          return next()
        }

        try {
          const bundle = await environments.node.loadBundle<typeof import('./src/server')>('index')
          const result = await bundle.render(
            url,
            req.headers.host,
            req.headers.cookie
          )

          // effector-гарды сделали редирект (например / -> /feed)
          if ('redirect' in result) {
            res.writeHead(302, { Location: result.redirect })
            res.end()
            return
          }

          const template = await environments.web.getTransformedHtml('index')
          const html = template
            .replace('lang=""', `lang="${result.locale}"`)
            .replace(
              '</head>',
              `<script>self.__SSR_STATE__ = ${JSON.stringify(result.scopeData).replace(/</g, '\\u003c')}</script></head>`
            )
            .replace('<!--app-content-->', result.html)

          res.writeHead(result.status || 200, { 'Content-Type': 'text/html' })
          res.end(html)
        } catch (err) {
          console.error('SSR render failed:', err)
          next()
        }
      })
    }
  }
})
