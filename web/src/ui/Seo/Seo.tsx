import { useUnit } from 'effector-react'

import { $origin } from '@logic/session'

interface SeoProps {
  path: string
}

/**
 * Canonical + hreflang теги для двух доменов.
 * Рендерит canonical на текущий домен и hreflang-ссылки на обе версии.
 */
export const SEO = ({ path }: SeoProps) => {
  const origin = useUnit($origin)

  const appUrl = `https://meowter.app${path}`
  const ruUrl = `https://meowter.ru${path}`
  const canonicalUrl = `${origin}${path}`

  return (
    <>
      <link rel='canonical' href={canonicalUrl} />
      <link rel='alternate' hrefLang='en' href={appUrl} />
      <link rel='alternate' hrefLang='ru' href={ruUrl} />
      <link rel='alternate' hrefLang='x-default' href={appUrl} />
    </>
  )
}
