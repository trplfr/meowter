import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import { Container } from './Modal.style'

export const Modal = ({ node, title, content, accept, decline }) => {
  const target = document.querySelector(node || '#root')

  const modal = <Container>Hello!</Container>

  return target && ReactDOM.createPortal(modal, target)
}

Modal.propTypes = {
  node: PropTypes.string,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  accept: PropTypes.string,
  decline: PropTypes.string
}
