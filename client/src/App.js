import React from 'react'
import { Helmet } from 'react-helmet-async'
import { ToastContainer } from 'react-toastify'

import { TITLE, TEMPLATE } from 'core/helmet'

import { Routes } from 'screens/routes'

import 'react-toastify/dist/ReactToastify.css'

export const App = () => {
  return (
    <>
      <Helmet defaultTitle={TITLE} titleTemplate={TEMPLATE} />
      <Routes />
      <ToastContainer />
    </>
  )
}
