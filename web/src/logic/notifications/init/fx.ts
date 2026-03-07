import { toast } from 'sonner'

import { showErrorToastFx } from '../models'

showErrorToastFx.use((message) => {
  toast.error(message)
})
