import { toast } from 'sonner'

import { showErrorToastFx } from '../models'

showErrorToastFx.use((message) => {
  const id = toast.error(message, {
    onClick: () => toast.dismiss(id)
  })
})
