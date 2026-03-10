import './models/init'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'

import { routes } from '@core/router'

import { Layout } from '@modules/Layout'
import { MeowCardSkeleton } from '@modules/MeowCard'

import { VirtualList } from '@ui/VirtualList'

import {
  $notifications,
  $hasMore,
  loadMore,
  notificationsQuery
} from './models'
import { NotificationCard } from './NotificationCard'

import s from './Notifications.module.scss'

export const route = routes.notifications

export const Notifications = () => {
  const [notificationsList, hasMore, pending] = useUnit([
    $notifications,
    $hasMore,
    notificationsQuery.$pending
  ])
  const onLoadMore = useUnit(loadMore)

  return (
    <Layout title={<Trans>Уведомления</Trans>} contentClassName={s.content}>
      <title>{t`Уведомления / Мяутер`}</title>
      <meta name='robots' content='noindex' />

      {pending && notificationsList.length === 0 && (
        <div className={s.skeletons}>
          <MeowCardSkeleton />
          <MeowCardSkeleton />
          <MeowCardSkeleton />
        </div>
      )}

      {notificationsList.length > 0 && (
        <VirtualList
          items={notificationsList}
          estimateSize={80}
          hasMore={hasMore}
          pending={pending}
          onLoadMore={onLoadMore}
          className={s.list}
          renderItem={notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
            />
          )}
        />
      )}

      {notificationsList.length === 0 && !pending && (
        <div className={s.empty}>
          <Trans>Пока нет уведомлений</Trans>
        </div>
      )}
    </Layout>
  )
}
