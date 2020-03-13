import { createGlobalStyle } from 'styled-components'

import { normalize } from 'core/styles/normalize'

import Rubik from 'assets/fonts/Rubik/Rubik-Medium.ttf'

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  
  @font-face {
    font-family: 'Rubik';
    font-style: normal;
    font-weight: normal;
    src:
      url('${Rubik}') format('ttf')
  }
  
  * { 
    box-sizing: border-box;
    font-family: 'Rubik', sans-serif;
  }
  
  html, body, body > div {
    display: flex;
    width: 100%;
    height: 100%;
  }
`
