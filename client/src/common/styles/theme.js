import React from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'

const theme = {
  colors: {
    white: '#FFF',
    primary: '#EB7E44',
    black: '#303030',
    gray: 'rgba(48, 48, 48, 0.3)',
    lightPrimary: 'rgb(235, 126, 68, 0.5)',
    lightGray: 'rgba(48, 48, 48, 0.1)'
  },
  fontSizes: {
    small: '14px',
    medium: '16px',
    large: '22px',
    huge: '48px'
  },
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    bold: '700'
  },
  mobile: 'max-width: 768px'
}

export const Theme = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

Theme.propTypes = {
  children: PropTypes.node.isRequired
}
