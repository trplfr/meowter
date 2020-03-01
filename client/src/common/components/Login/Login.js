import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { requestLogin } from 'modules/actions/login.actions'

import {
  Accept,
  Container,
  Description,
  Field,
  Heading
} from 'common/components/Login/Login.style'

export const Login = () => {
  const dispatch = useDispatch()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = ({ target: { value } }) => setLogin(value)
  const handlePassword = ({ target: { value } }) => setPassword(value)

  const signIn = useCallback(
    () => dispatch(requestLogin({ login, password })),
    [login, password]
  )

  return (
    <Container>
      <Heading>Авторизация</Heading>
      <Description>
        Войдите в аккаунт, чтобы продолжить обсуждать любимые темы
      </Description>
      <Field onChange={handleLogin} placeholder='Почта или телефон' />
      <Field onChange={handlePassword} placeholder='Пароль' />
      <Accept onClick={signIn}>Далее</Accept>
    </Container>
  )
}
