import * as yup from 'yup'

export const registrationSchema = yup.object({
  username: yup.string().required('Введите никнейм'),
  password: yup.string().required('Введите пароль'),
  login: yup.string().required('Введите почту или телефон')
})
