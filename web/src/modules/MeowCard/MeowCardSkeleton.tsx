import { Skeleton } from '@ui/Skeleton'

import s from './MeowCard.module.scss'

export const MeowCardSkeleton = () => (
  <div className={s.card} aria-hidden>
    <div className={s.top}>
      <Skeleton width={45} height={45} borderRadius="50%" />
      <div className={s.meta}>
        <Skeleton width={120} height={14} />
        <Skeleton width={50} height={12} />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
      <Skeleton width="100%" height={14} />
      <Skeleton width="80%" height={14} />
      <Skeleton width="60%" height={14} />
    </div>
  </div>
)
