import { login, register, recovery, uploadAvatar } from '@logic/api/auth'

import { loginFx, registerFx, recoveryFx, uploadAvatarFx } from '../models'

loginFx.use(login)
registerFx.use(register)
recoveryFx.use(recovery)
uploadAvatarFx.use(uploadAvatar)
