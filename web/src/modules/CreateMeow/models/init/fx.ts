import { createMeow } from '@logic/api/meows'

import { createMeowFx } from '../models'

createMeowFx.use((params) => createMeow(params))
