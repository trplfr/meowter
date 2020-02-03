import { createGlobalStyle } from 'styled-components'

import { normalize } from 'common/styles/normalize'

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  
  html, body, body > div {
    width: 100%;
    height: 100%;
  }
  
  body > div {
    display: flex;
  }
`
