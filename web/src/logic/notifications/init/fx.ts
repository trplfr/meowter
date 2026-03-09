import { toast } from 'sonner'

import { showErrorToastFx, showSuccessToastFx } from '../models'

showErrorToastFx.use(message => {
  if (typeof window === 'undefined') {
    return
  }

  toast.error(message, { dismissible: true })
})

showSuccessToastFx.use(message => {
  if (typeof window === 'undefined') {
    return
  }

  toast.success(message, { dismissible: true })
})
