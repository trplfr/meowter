import React from 'react'
import { Helmet } from 'react-helmet-async'

import { Router } from 'common/routes'
import { Layout } from 'screens/Layout'

import { TITLE, TEMPLATE } from 'common/const/helmet'

export const App = () => {
  return (
    <>
      <Helmet defaultTitle={TITLE} titleTemplate={TEMPLATE} />
      <Layout>
        <Router />
      </Layout>
    </>
  )
}
