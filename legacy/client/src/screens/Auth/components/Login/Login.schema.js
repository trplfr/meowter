import * as yup from 'yup'

export const loginSchema = yup.object({
  login: yup.string().required('Введите почту или телефон'),
  password: yup.string().required('Введите пароль')
})
