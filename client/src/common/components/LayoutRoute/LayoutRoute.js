import React from 'react'
import { Route } from 'react-router-dom'
import PropTypes from 'prop-types'

import { Footer, Header } from 'common/components'

import { Layout, Wrapper } from './LayoutRoute.style'

export const LayoutRoute = ({
  component: Component,
  header: { ...restHeader },
  footer: { ...restFooter },
  ...rest
}) => {
  return (
    <Layout>
      <Header {...restHeader} />
      <Wrapper>
        <Route {...rest} render={props => <Component {...rest} {...props} />} />
      </Wrapper>
      <Footer {...restFooter} />
    </Layout>
  )
}

LayoutRoute.propTypes = {
  component: PropTypes.func,
  header: PropTypes.shape({
    title: PropTypes.string,
    isBorder: PropTypes.bool,
    isBack: PropTypes.bool,
    isBurger: PropTypes.bool,
    isNotifications: PropTypes.bool,
    isMeowt: PropTypes.bool
  }),
  footer: PropTypes.shape({
    link: PropTypes.exact({
      to: PropTypes.string,
      content: PropTypes.string,
      isBack: PropTypes.bool
    }),
    isMenu: PropTypes.bool
  })
}
