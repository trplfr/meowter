import { toast } from 'sonner'

import { showErrorToastFx } from '../models'

showErrorToastFx.use((message) => {
  if (typeof window === 'undefined') {
    return
  }

  toast.error(message, { dismissible: true })
})
