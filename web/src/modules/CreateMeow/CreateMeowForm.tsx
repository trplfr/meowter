import './models/init'

import { useRef } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import clsx from 'clsx'
import { ImagePlus, X } from 'lucide-react'

import { MEOW_CONTENT_MAX } from '@shared/constants'

import {
  $text,
  $hasTildes,
  $imagePreview,
  $replyToMeow,
  textChanged,
  imageSelected,
  imageRemoved,
  submitted,
  replyToCleared,
  createMeowMutation
} from './models'

import { $weeklyTag } from '@logic/topics'
import { highlightTildes } from '@lib/meow'

import { Avatar } from '@modules/MeowCard'

import s from './CreateMeowForm.module.scss'

export const CreateMeowForm = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const [text, hasTildes, preview, replyTo, pending, weeklyTag] = useUnit([
    $text,
    $hasTildes,
    $imagePreview,
    $replyToMeow,
    createMeowMutation.$pending,
    $weeklyTag
  ])
  const [onTextChange, onImageSelect, onImageRemove, onSubmit, onClearReply] =
    useUnit([
      textChanged,
      imageSelected,
      imageRemoved,
      submitted,
      replyToCleared
    ])

  const remaining = MEOW_CONTENT_MAX - text.length

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    onImageSelect(file)
    e.target.value = ''
  }

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }

  return (
    <div className={s.form}>
      <div className={s.editor}>
        <div ref={backdropRef} className={s.backdrop} aria-hidden>
          {highlightTildes(text)}
        </div>
        <textarea
          id='meow-content'
          name='content'
          aria-label={t`Расскажи, что сегодня случилось?`}
          className={clsx(s.textarea, remaining < 0 && s.textareaError)}
          value={text}
          onChange={e => onTextChange(e.target.value)}
          onScroll={handleScroll}
          placeholder={t`Расскажи, что сегодня случилось?`}
          rows={6}
        />
      </div>

      <p className={s.hint}>
        {remaining < 0 ? (
          <span className={s.overLimit}>
            <Trans>
              Превышено количество символов ({text.length}/{MEOW_CONTENT_MAX})
            </Trans>
          </span>
        ) : weeklyTag ? (
          <Trans>
            Тема недели:{' '}
            <button
              type='button'
              className={s.weeklyTagBtn}
              onClick={() =>
                onTextChange(
                  text + (text.length > 0 ? ' ' : '') + `~${weeklyTag}`
                )
              }
            >
              ~{weeklyTag}
            </button>
            <br />
            Выдели слово, используя тильду:
            <br />
            <span className={s.tilde}>~работа</span>, чтобы составить ленту
          </Trans>
        ) : (
          <Trans>
            Выдели слово, используя тильду:
            <br />
            <span className={s.tilde}>~работа</span>, чтобы составить ленту
          </Trans>
        )}
      </p>

      <div className={s.toolbar}>
        {preview ? (
          <div className={s.preview}>
            <img className={s.previewImage} src={preview} alt='' />
            <button
              type='button'
              aria-label='Удалить изображение'
              className={s.previewRemove}
              onClick={() => onImageRemove()}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type='button'
            aria-label='Прикрепить изображение'
            className={s.imageButton}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus size={22} />
          </button>
        )}

        <input
          ref={fileRef}
          type='file'
          accept='image/*'
          className={s.fileInput}
          onChange={handleFileChange}
        />

        {replyTo && (
          <div className={s.replyPreview}>
            <div className={s.replyPreviewTop}>
              <Avatar
                src={replyTo.author.avatarUrl}
                alt={replyTo.author.displayName}
              />
              <span className={s.replyPreviewAuthor}>
                {replyTo.author.displayName}
              </span>
              <button
                type='button'
                aria-label='Убрать ответ'
                className={s.replyPreviewClose}
                onClick={() => onClearReply()}
              >
                <X size={14} />
              </button>
            </div>
            <div className={s.replyPreviewContent}>
              {replyTo.content.length > 100
                ? replyTo.content.slice(0, 100) + '...'
                : replyTo.content}
            </div>
          </div>
        )}

        <button
          className={s.submitButton}
          disabled={pending || !hasTildes || remaining < 0}
          onClick={() => onSubmit()}
        >
          <Trans>Мяутнуть</Trans>
        </button>
      </div>
    </div>
  )
}
