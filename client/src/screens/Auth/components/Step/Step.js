import React from 'react'

import { Back, Header } from 'components'

import { Screen } from './Step.style'

export const Step = () => {
  return (
    <Screen>
      <Header left={<Back />} />
    </Screen>
  )
}
