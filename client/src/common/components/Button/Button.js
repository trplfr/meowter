import React from 'react'
import PropTypes from 'prop-types'

import { Loader } from 'common/components'

import Uploader from 'assets/icons/upload.svg'

import { Button as Entity } from './Button.style'

export const Button = ({ isLoading, isUploader, children, ...rest }) => {
  return (
    <Entity isLoading={isLoading} disabled={isLoading} {...rest}>
      {isUploader && <Uploader />}
      {isLoading ? <Loader /> : children}
    </Entity>
  )
}

Button.propTypes = {
  isLoading: PropTypes.bool,
  isUploader: PropTypes.bool,
  children: PropTypes.node.isRequired
}
