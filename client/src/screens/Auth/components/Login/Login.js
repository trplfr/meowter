import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'

import { requestLogin } from 'store/actions/login.actions'

import { API } from 'core/api'

import {
  Accept,
  Form,
  Description,
  Field,
  Heading
} from 'screens/Auth/Auth.style'

import { loginSchema as schema } from './Login.schema'

export const Login = () => {
  const dispatch = useDispatch()

  const [, setError] = useState()

  const { register, errors, handleSubmit } = useForm({
    validationSchema: schema
  })

  const onSubmit = data => dispatch(requestLogin(data))

  const getMeows = () => {
    // API.get('meows')
    // API.get('meows?search=1')
    // API.get('meows?search=2')
  }

  const getError = () => {
    setError(() => {
      throw new Error('Привет!')
    })
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Heading>Авторизация</Heading>
      <Description>
        Войдите в аккаунт, чтобы продолжить обсуждать любимые темы
      </Description>
      <Field
        label='login'
        placeholder='Почта или телефон'
        register={register}
        errors={errors}
        autoComplete='off'
      />
      <Field
        label='password'
        placeholder='Пароль'
        register={register}
        errors={errors}
        autoComplete='off'
        isPasswordField
      />
      <Accept type='submit'>Далее</Accept>
      <Accept onClick={getError}>Получить ошибку</Accept>
    </Form>
  )
}
