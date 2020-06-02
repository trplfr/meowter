import React from 'react'
import { Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PropTypes from 'prop-types'

import { Footer } from 'components'

import { Layout, Wrapper } from './LayoutRoute.style'

export const LayoutRoute = ({
  component: Component,
  footer: { ...restFooter },
  helmet,
  ...rest
}) => {
  return (
    <Layout>
      {helmet && (
        <Helmet>
          <title>{helmet.title}</title>
          <meta name='description' content={`${helmet.description}`} />
        </Helmet>
      )}
      <Wrapper>
        <Route {...rest} render={props => <Component {...rest} {...props} />} />
      </Wrapper>
      <Footer {...restFooter} />
    </Layout>
  )
}

LayoutRoute.propTypes = {
  component: PropTypes.func,
  helmet: PropTypes.exact({
    title: PropTypes.string.isRequired,
    description: PropTypes.string
  }),
  footer: PropTypes.shape({
    body: PropTypes.element,
    isMenu: PropTypes.bool
  })
}
