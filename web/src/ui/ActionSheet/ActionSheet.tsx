import { useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Ellipsis, type LucideIcon } from 'lucide-react'

import s from './ActionSheet.module.scss'

interface ActionSheetItem {
  label: ReactNode
  icon: LucideIcon
  onClick: () => void
  variant?: 'danger'
}

interface ActionSheetProps {
  items: ActionSheetItem[]
}

export const ActionSheet = ({ items }: ActionSheetProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={s.trigger} aria-label="Действия">
          <Ellipsis size={18} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={s.overlay} />
        <Dialog.Content className={s.sheet} aria-describedby={undefined}>
          <Dialog.Title className={s.srOnly}>Действия</Dialog.Title>
          <div className={s.handle} />
          <div className={s.items}>
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                className={item.variant === 'danger' ? s.itemDanger : s.item}
                onClick={() => {
                  item.onClick()
                  setOpen(false)
                }}
              >
                <span className={s.itemLabel}>{item.label}</span>
                <item.icon size={20} />
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
