import React from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'

import { requestRegister } from 'store/actions/register.actions'

import {
  Accept,
  Form,
  Description,
  Field,
  Heading
} from 'screens/Auth/Auth.style'

import { registrationSchema as schema } from './Registration.schema'

export const Registration = () => {
  const dispatch = useDispatch()

  const { register, errors, handleSubmit } = useForm({
    validationSchema: schema
  })

  const onSubmit = data => dispatch(requestRegister(data))

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Heading>Давайте начинать</Heading>
      <Description>
        Заведите аккаунт, чтобы полноценно пользоваться нашим сервисом
      </Description>
      <Field
        label='username'
        register={register}
        autoComplete='off'
        errors={errors}
        placeholder='Никнейм'
      />
      <Field
        label='password'
        register={register}
        autoComplete='off'
        errors={errors}
        placeholder='Пароль'
        isPasswordField
      />
      <Field
        placeholder='Почта или телефон'
        label='login'
        register={register}
        autoComplete='off'
        errors={errors}
      />
      <Accept type='submit'>Далее</Accept>
    </Form>
  )
}
