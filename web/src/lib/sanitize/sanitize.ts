import DOMPurify from 'isomorphic-dompurify'

/** Sanitizes HTML string, removing dangerous tags and attributes */
export const sanitize = (dirty: string): string =>
  DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  })

/** Sanitizes and returns HTML suitable for dangerouslySetInnerHTML */
export const sanitizeToHtml = (dirty: string): { __html: string } => ({
  __html: sanitize(dirty)
})
