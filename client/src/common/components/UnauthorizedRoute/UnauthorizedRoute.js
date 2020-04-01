import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'

export const UnauthorizedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (user) {
          return <Component {...rest} {...props} />
        }

        return <Redirect to='/not-logged-in' />
      }}
    />
  )
}

UnauthorizedRoute.propTypes = {
  component: PropTypes.element
}
