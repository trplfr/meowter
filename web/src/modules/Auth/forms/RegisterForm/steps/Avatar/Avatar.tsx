import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, Upload } from 'lucide-react'

import { Button, Loader } from '@ui/index'

import { avatarSkipped, avatarFileSelected, $isUploading } from '../../../../models'

import s from '../steps.module.scss'

export const Avatar = () => {
  const [onSkip, onFileSelected, isUploading] = useUnit([avatarSkipped, avatarFileSelected, $isUploading])

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
    noClick: true,
    onDrop: (files) => {
      if (files[0]) {
        onFileSelected(files[0])
      }
    }
  })

  return (
    <div className={s.form} {...getRootProps()}>
      <input {...getInputProps()} />

      <button type="button" className={s.avatarZone} onClick={open} disabled={isUploading}>
        {isUploading
          ? <Loader size={38} />
          : <ImagePlus size={24} className={s.iconMuted} />
        }
      </button>

      <h1 className={s.title}>
        <Trans>Выберите аватар</Trans>
      </h1>
      <p className={s.description}>
        <Trans>Ваши друзья найдут вас быстрее, если вы загрузите свое фото</Trans>
      </p>

      <Button
        variant="primary"
        fullWidth
        isLoading={isUploading}
        onClick={open}
      >
        <Upload size={20} />
      </Button>

      <button type="button" className={s.link} onClick={onSkip} disabled={isUploading}>
        <Trans>Пропустить</Trans>
      </button>
    </div>
  )
}
