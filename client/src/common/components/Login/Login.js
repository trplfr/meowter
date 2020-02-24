import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { requestLogin } from 'modules/actions/login.actions'

import { Container, Heading, Field, Button } from './Login.style'

export const Login = () => {
  const dispatch = useDispatch()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = ({ target: { value } }) => setLogin(value)
  const handlePassword = ({ target: { value } }) => setPassword(value)

  const toLogin = useCallback(
    () => dispatch(requestLogin({ login, password })),
    [login, password]
  )

  return (
    <Container>
      <Heading>Вход</Heading>
      <Field onChange={handleLogin} placeholder='Логин' />
      <Field onChange={handlePassword} placeholder='Пароль' />
      <Button onClick={toLogin}>Войти</Button>
    </Container>
  )
}
