import React from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'

export const theme = {
  colors: {
    white: '#FFF',
    primary: {
      default: '#EB7E44',
      hover: '#F07132',
      active: '#DD6221',
      disabled: 'rgb(235, 126, 68, 0.7)',
      light: 'rgb(235, 126, 68, 0.5)'
    },
    black: '#303030',
    gray: {
      default: 'rgba(48, 48, 48, 0.3)',
      light: 'rgba(48, 48, 48, 0.1)'
    }
  },
  fontSizes: {
    tiny: '12px',
    small: '14px',
    medium: '16px',
    large: '22px',
    huge: '32px'
  },
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    bold: '700'
  },
  media: {
    mobile: 'max-width: 768px',
    desktop: 'min-width: 769px'
  }
}

export const Theme = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

Theme.propTypes = {
  children: PropTypes.node.isRequired
}
