import React, { Component } from 'react'
import { Redirect } from 'react-router'
import PropTypes from 'prop-types'

export class ErrorBoundary extends Component {
  state = {
    error: null,
    exception: null
  }

  componentDidCatch(error, exception) {
    this.setState({
      error,
      exception
    })
  }

  render() {
    const { error, exception } = this.state
    const { children } = this.props

    if (exception) {
      return (
        <>
          <Redirect
            push
            to={{ pathname: '/error', state: { error, exception } }}
          />
          {children}
        </>
      )
    }

    return children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
}
