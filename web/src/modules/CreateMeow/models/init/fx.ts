import { createMeowFx } from '../models'

// TODO: подключить API когда будет готов эндпоинт
createMeowFx.use(async (params) => {
  console.log('create meow', params)
})
