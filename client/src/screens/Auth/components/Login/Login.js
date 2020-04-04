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

  const [, setState] = useState()

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
    setState(() => {
      throw new Error('Привет!')
    })
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Heading>Авторизация</Heading>
        <Description>
          Войдите в аккаунт, чтобы продолжить обсуждать любимые темы
        </Description>
        <Field
          label='login'
          register={register}
          errors={errors}
          placeholder='Почта или телефон'
          autoComplete='off'
        />
        <Field
          label='password'
          register={register}
          errors={errors}
          placeholder='Пароль'
          autoComplete='off'
        />
        <Accept type='submit'>Далее</Accept>
        <Accept onClick={getError}>Получить ошибку</Accept>
      </Form>
    </>
  )
}
