import { updateProfile, changePassword, uploadAvatar } from '@logic/api/auth'

import { updateProfileFx, changePasswordFx, uploadAvatarFx } from '../models'

updateProfileFx.use(params => updateProfile(params))
changePasswordFx.use(params => changePassword(params))
uploadAvatarFx.use(file => uploadAvatar(file))
