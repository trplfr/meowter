import { type LinguiConfig } from '@lingui/conf'

const config: LinguiConfig = {
  locales: ['ru', 'en'],
  sourceLocale: 'ru',
  catalogs: [
    {
      path: 'locales/{locale}/messages',
      include: ['src']
    }
  ]
}

export default config
