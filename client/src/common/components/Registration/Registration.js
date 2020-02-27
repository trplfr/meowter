import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { requestRegistration } from 'modules/actions/registration.actions'

import { Container, Heading, Field, Button } from 'screens/Auth/Auth.style'

export const Registration = () => {
  const dispatch = useDispatch()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = ({ target: { value } }) => setLogin(value)
  const handlePassword = ({ target: { value } }) => setPassword(value)

  const signUp = useCallback(
    () => dispatch(requestRegistration({ login, password })),
    [login, password]
  )

  return (
    <Container>
      <Heading>Регистрация</Heading>
      <Field onChange={handleLogin} placeholder='Логин' />
      <Field onChange={handlePassword} placeholder='Пароль' />
      <Button onClick={signUp}>Зарегистрироваться</Button>
    </Container>
  )
}
