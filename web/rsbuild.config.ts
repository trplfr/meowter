import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSass } from '@rsbuild/plugin-sass'

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  source: {
    entry: {
      index: './src/index.tsx'
    }
  },
  resolve: {
    alias: {
      '@shared': '../shared/src',
      '@screens': './src/screens',
      '@modules': './src/modules',
      '@ui': './src/ui',
      '@logic': './src/logic',
      '@lib': './src/lib',
      '@core': './src/core',
      '@assets': './src/assets'
    }
  },
  html: {
    title: 'Meowter',
    template: './src/index.html'
  },
  server: {
    port: 3000
  },
  output: {
    cssModules: {
      auto: true,
      localIdentName: '[local]--[hash:6]'
    }
  }
})
