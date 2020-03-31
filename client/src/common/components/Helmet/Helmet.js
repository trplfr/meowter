import React, { useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

export const Helmet = ({ header, footer, children }) => {
  return <>Hello!</>
}

Helmet.propTypes = {
  header: PropTypes.bool,
  footer: PropTypes.bool,
  children: PropTypes.node.isRequired
}
