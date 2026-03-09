import { i18n } from '@lingui/core'

import { messages as ruMessages } from '../../../locales/ru/messages'
import { messages as enMessages } from '../../../locales/en/messages'

const catalogs: Record<string, any> = {
  ru: ruMessages,
  en: enMessages
}

export const activateLocale = (locale: string) => {
  const messages = catalogs[locale] || catalogs.ru
  i18n.load(locale, messages)
  i18n.activate(locale)
}

// дефолт = русский
activateLocale('ru')

export { i18n }
