import './models/init'

import { useEffect } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'
import { useUnit } from 'effector-react'
import { useInView } from 'react-intersection-observer'

import { routes } from '@core/router'

import { AuthLayout } from '@modules/AuthLayout'
import { MeowCardSkeleton } from '@modules/MeowCard'

import {
  $notifications,
  $hasMore,
  pageOpened,
  loadMore,
  fetchNotificationsFx
} from './models'
import { NotificationCard } from './NotificationCard'

import s from './Notifications.module.scss'

export const route = routes.notifications

export const Notifications = () => {
  const [notificationsList, hasMore, pending] = useUnit([$notifications, $hasMore, fetchNotificationsFx.pending])
  const [onOpen, onLoadMore] = useUnit([pageOpened, loadMore])

  const { ref: sentinelRef, inView } = useInView()

  useEffect(() => {
    onOpen()
  }, [])

  useEffect(() => {
    if (inView && hasMore && !pending) {
      onLoadMore()
    }
  }, [inView, hasMore, pending])

  return (
    <AuthLayout title={<Trans>Уведомления</Trans>} contentClassName={s.content}>
      <Helmet>
        <title>{t`Уведомления / Мяутер`}</title>
      </Helmet>

      <div className={s.list}>
        {pending && notificationsList.length === 0 && (
          <>
            <MeowCardSkeleton />
            <MeowCardSkeleton />
            <MeowCardSkeleton />
          </>
        )}

        {notificationsList.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}

        {notificationsList.length === 0 && !pending && (
          <div className={s.empty}>
            <Trans>Пока нет уведомлений</Trans>
          </div>
        )}
      </div>

      {hasMore && <div ref={sentinelRef} className={s.sentinel} />}
    </AuthLayout>
  )
}
