import clsx from 'clsx'

import s from './Skeleton.module.scss'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
}

export const Skeleton = ({ width, height, borderRadius, className }: SkeletonProps) => (
  <div
    className={clsx(s.skeleton, className)}
    style={{ width, height, borderRadius }}
  />
)
