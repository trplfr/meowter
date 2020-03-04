import React from 'react'
import { Helmet } from 'react-helmet-async'

import { Layout } from 'screens'
import { Routes } from 'screens/routes'

import { TITLE, TEMPLATE } from 'core/const/helmet'

export const App = () => {
  return (
    <>
      <Helmet defaultTitle={TITLE} titleTemplate={TEMPLATE} />
      <Layout>
        <Routes />
      </Layout>
    </>
  )
}
