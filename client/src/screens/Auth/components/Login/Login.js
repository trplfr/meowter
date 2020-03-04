import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { requestLogin } from 'store/actions/login.actions'

// import { API } from 'core/api'

import {
  Accept,
  Container,
  Description,
  Field,
  Heading
} from 'screens/Auth/Auth.style'

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

  // const getMeows = () => API.get('meows')

  return (
    <Container>
      <Heading>Авторизация</Heading>
      <Description>
        Войдите в аккаунт, чтобы продолжить обсуждать любимые темы
      </Description>
      <Field onChange={handleLogin} placeholder='Почта или телефон' />
      <Field onChange={handlePassword} placeholder='Пароль' />
      <Accept onClick={signIn}>Далее</Accept>
      {/* <Accept onClick={getMeows}>Получить мяуты</Accept> */}
    </Container>
  )
}
