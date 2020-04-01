import React from 'react'
import { Redirect } from 'react-router'

export const NotFound = () => {
  return (
    <>
      <Redirect to='/404' />
      Не найдено!
    </>
  )
}
