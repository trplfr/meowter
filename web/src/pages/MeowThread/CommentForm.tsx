import { useRef, useEffect } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Send } from 'lucide-react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { COMMENT_CONTENT_MAX } from '@shared/constants'

import { $commentText, $replyTrigger, commentTextChanged, commentSubmitted, createCommentMutation } from './models'

import s from './MeowThread.module.scss'

export const CommentForm = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [text, replyTrigger, pending] = useUnit([$commentText, $replyTrigger, createCommentMutation.$pending])
  const [onTextChange, onSubmit] = useUnit([commentTextChanged, commentSubmitted])

  const isOverLimit = text.length > COMMENT_CONTENT_MAX

  // автофокус при нажатии "ответить"
  useEffect(() => {
    if (replyTrigger > 0 && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = text.length
      textareaRef.current.selectionEnd = text.length
    }
  }, [replyTrigger])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className={s.commentFormWrap}>
      {isOverLimit && (
        <div className={s.commentError}>
          <Trans>Превышено количество символов ({text.length}/{COMMENT_CONTENT_MAX})</Trans>
        </div>
      )}
      <div className={s.commentForm}>
        <textarea
          ref={textareaRef}
          id="comment"
          name="comment"
          aria-label={t`Написать комментарий...`}
          className={clsx(s.commentTextarea, isOverLimit && s.commentTextareaError)}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t`Написать комментарий...`}
          rows={2}
        />
        <button
          type="button"
          aria-label="Отправить"
          className={s.commentSendButton}
          disabled={pending || text.trim().length === 0 || isOverLimit}
          onClick={() => onSubmit()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}
