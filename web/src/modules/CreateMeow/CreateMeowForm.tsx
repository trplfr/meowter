import './models/init'

import { useRef } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { ImagePlus, X } from 'lucide-react'

import {
  $text,
  $hasTildes,
  $imagePreview,
  textChanged,
  imageSelected,
  imageRemoved,
  submitted,
  createMeowMutation
} from './models'

import { highlightTildes } from '@lib/meow'

import s from './CreateMeowForm.module.scss'

export const CreateMeowForm = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const [text, hasTildes, preview, pending] = useUnit([$text, $hasTildes, $imagePreview, createMeowMutation.$pending])
  const [onTextChange, onImageSelect, onImageRemove, onSubmit] = useUnit([
    textChanged,
    imageSelected,
    imageRemoved,
    submitted
  ])

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
          id="meow-content"
          name="content"
          aria-label={t`Расскажи, что сегодня случилось?`}
          className={s.textarea}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onScroll={handleScroll}
          placeholder={t`Расскажи, что сегодня случилось?`}
          rows={6}
        />
      </div>

      <p className={s.hint}>
        <Trans>
          Выдели слово, используя тильду:
          <br />
          <span className={s.tilde}>~работа</span>, чтобы составить ленту
        </Trans>
      </p>

      <div className={s.toolbar}>
        {preview ? (
          <div className={s.preview}>
            <img className={s.previewImage} src={preview} alt="" />
            <button type="button" aria-label="Удалить изображение" className={s.previewRemove} onClick={() => onImageRemove()}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label="Прикрепить изображение"
            className={s.imageButton}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus size={22} />
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={s.fileInput}
          onChange={handleFileChange}
        />

        <button
          className={s.submitButton}
          disabled={pending || !hasTildes}
          onClick={() => onSubmit()}
        >
          <Trans>Мяутнуть</Trans>
        </button>
      </div>
    </div>
  )
}
