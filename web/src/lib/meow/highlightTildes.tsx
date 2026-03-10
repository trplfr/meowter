import { type ReactNode } from 'react'

// разбивает текст на фрагменты, оборачивая ~слово в mark или ссылку
export const highlightTildes = (
  text: string,
  className?: string,
  linkable?: boolean
): ReactNode[] => {
  const parts: ReactNode[] = []
  const regex = /(~[\w\u0400-\u04FF]+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const tag = match[0].slice(1)

    if (linkable) {
      parts.push(
        <a
          key={`tilde-${match.index}`}
          href={`/search?tag=${encodeURIComponent(tag)}`}
          className={className}
        >
          {match[0]}
        </a>
      )
    } else {
      parts.push(
        <mark key={match.index} data-tilde className={className}>
          {match[0]}
        </mark>
      )
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  // сохраняем trailing newline чтобы overlay не схлопывался
  if (text.endsWith('\n')) {
    parts.push(' ')
  }

  return parts
}
