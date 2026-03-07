import { useUnit } from 'effector-react'

import { $registerStep, AuthStep } from '../../models'

import { Credentials } from './steps/Credentials'
import { Avatar } from './steps/Avatar'
import { Done } from './steps/Done'

export const RegisterForm = () => {
  const step = useUnit($registerStep)

  if (step === AuthStep.AVATAR) {
    return <Avatar />
  }

  if (step === AuthStep.DONE) {
    return <Done />
  }

  return <Credentials />
}
