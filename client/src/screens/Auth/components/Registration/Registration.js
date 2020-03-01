import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { requestRegistration } from 'modules/actions/registration.actions'

import {
  Accept,
  Container,
  Description,
  Field,
  Heading
} from 'screens/Auth/Auth.style'

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
      <Heading>Давайте начинать</Heading>
      <Description>
        Заведите аккаунт, чтобы полноценно пользоваться нашим сервисом
      </Description>
      <Field onChange={handleLogin} placeholder='Логин' />
      <Field onChange={handlePassword} placeholder='Пароль' />
      <Field placeholder='Почта или телефон' />
      <Accept onClick={signUp}>Далее</Accept>
    </Container>
  )
}
