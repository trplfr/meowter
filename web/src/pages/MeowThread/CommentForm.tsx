import { useRef, useEffect } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Send } from 'lucide-react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { COMMENT_CONTENT_MAX } from '@shared/constants'

import { $session } from '@logic/session'
import { showErrorToastFx } from '@logic/notifications'
import { highlightMentionsOverlay } from '@lib/meow'

import {
  $commentText,
  $replyTrigger,
  commentTextChanged,
  commentSubmitted,
  createCommentMutation
} from './models'

import s from './MeowThread.module.scss'

export const CommentForm = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const [text, replyTrigger, pending, session] = useUnit([
    $commentText,
    $replyTrigger,
    createCommentMutation.$pending,
    $session
  ])
  const [onTextChange, onSubmit, onShowError] = useUnit([
    commentTextChanged,
    commentSubmitted,
    showErrorToastFx
  ])

  const emailVerified = session?.emailVerified ?? false
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

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }

  const handleEditorClick = () => {
    if (!emailVerified) {
      onShowError(t`Подтвердите почту`)
    }
  }

  return (
    <div className={s.commentFormWrap}>
      {emailVerified && isOverLimit && (
        <div className={s.commentError}>
          <Trans>
            Превышено количество символов ({text.length}/{COMMENT_CONTENT_MAX})
          </Trans>
        </div>
      )}
      <div className={s.commentForm}>
        <div className={s.commentEditor}>
          <div ref={backdropRef} className={s.commentBackdrop} aria-hidden>
            {highlightMentionsOverlay(text)}
          </div>
          <textarea
            ref={textareaRef}
            id='comment'
            name='comment'
            aria-label={t`Написать комментарий...`}
            className={clsx(
              s.commentTextarea,
              isOverLimit && s.commentTextareaError
            )}
            value={text}
            onChange={e => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            placeholder={t`Написать комментарий...`}
            rows={2}
            disabled={!emailVerified}
          />
          {!emailVerified && (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div className={s.commentOverlay} onClick={handleEditorClick} />
          )}
        </div>
        <button
          type='button'
          aria-label='Отправить'
          className={s.commentSendButton}
          disabled={pending || text.trim().length === 0 || isOverLimit || !emailVerified}
          onClick={() => onSubmit()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}
