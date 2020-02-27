import styled from 'styled-components'

import { H2 } from 'common/styles/typography'
import { buttonStyles } from 'common/components/Button/Button.style'
import { inputStyles } from 'common/components/Input/Input.style'

export const Screen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

export const Button = styled.button`
  ${buttonStyles};

  width: 50%;
  height: 25px;
`

export const Field = styled.input`
  ${inputStyles};

  width: 50%;
  margin: 0 0 1em 0;
`

export const Heading = styled.h1`
  ${H2};
`
