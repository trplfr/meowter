import React from 'react'
import { useHistory } from 'react-router'
import PropTypes from 'prop-types'

import Arrow from 'assets/icons/arrow.svg'

import { Anchor } from 'core/styles/typography'

import { Button } from 'components/Back/Back.style'

export const Back = ({ children }) => {
  const { goBack } = useHistory()

  return children ? (
    <Anchor as='button' onClick={goBack}>
      {children}
    </Anchor>
  ) : (
    <Button onClick={goBack}>
      <Arrow />
    </Button>
  )
}

Back.propTypes = {
  children: PropTypes.node
}
