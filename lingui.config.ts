import { type LinguiConfig } from '@lingui/conf'

const config: LinguiConfig = {
  locales: ['ru', 'en'],
  sourceLocale: 'ru',
  catalogs: [
    {
      path: 'web/locales/{locale}/messages',
      include: ['web/src']
    }
  ]
}

export default config
