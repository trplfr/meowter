import { loginFx, registerFx, recoveryFx, uploadAvatarFx } from '../models'

// TODO: заменить на реальные API-вызовы
loginFx.use(async (_params) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
})

registerFx.use(async (_params) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
})

recoveryFx.use(async (_params) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
})

// TODO: заменить на реальный аплоад
uploadAvatarFx.use(async (file) => {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return URL.createObjectURL(file)
})
