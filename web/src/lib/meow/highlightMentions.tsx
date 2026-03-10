import { type ReactNode } from 'react'

// разбивает текст на фрагменты, оборачивая @username в ссылку на профиль
export const highlightMentions = (
  text: string,
  mentionClass?: string
): ReactNode[] => {
  const parts: ReactNode[] = []
  const regex = /(@[\w\u0400-\u04FF]+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const username = match[0].slice(1)

    parts.push(
      <a
        key={`mention-${match.index}`}
        href={`/cat/${encodeURIComponent(username)}`}
        className={mentionClass}
      >
        {match[0]}
      </a>
    )

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

// подсветка @mentions в textarea overlay (без ссылок, только mark)
export const highlightMentionsOverlay = (text: string): ReactNode[] => {
  const parts: ReactNode[] = []
  const regex = /(@[\w\u0400-\u04FF]+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    parts.push(
      <mark key={match.index} data-mention>
        {match[0]}
      </mark>
    )

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
