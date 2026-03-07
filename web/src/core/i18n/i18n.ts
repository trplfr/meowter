import { i18n } from '@lingui/core'

// русский = исходный язык, сообщения берутся прямо из кода
i18n.loadAndActivate({ locale: 'ru', messages: {} })

export { i18n }
