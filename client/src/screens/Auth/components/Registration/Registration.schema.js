import * as yup from 'yup'

export const registrationSchema = yup.object({
  login: yup.string().required('Введите логин'),
  password: yup.string().required('Введите пароль'),
  verificationService: yup.string().required('Введите почту или телефон')
})
