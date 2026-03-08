import { ImageIcon } from 'lucide-react'

import s from './MeowCard.module.scss'

interface AvatarProps {
  src: string | null
  alt: string
}

export const Avatar = ({ src, alt }: AvatarProps) => {
  if (!src) {
    return (
      <div className={s.avatarPlaceholder}>
        <ImageIcon size={16} />
      </div>
    )
  }

  return <img className={s.avatar} src={src} alt={alt} />
}
