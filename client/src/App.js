import React from 'react'
import { Helmet } from 'react-helmet-async'

import { TITLE, TEMPLATE } from 'core/helmet'

import { Layout } from 'screens'
import { Routes } from 'screens/routes'

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
