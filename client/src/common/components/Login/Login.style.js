import styled from 'styled-components'

import { Button } from 'common/components/Button/Button.style'
import { Input } from 'common/components/Input/Input.style'
import { H1, Paragraph } from 'common/styles/typography'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

export const Accept = styled(Button)`
  width: 50%;

  @media (${props => props.theme.mobile}) {
    width: 100%;
  }
`

export const Field = styled(Input)`
  width: 50%;
  margin: 0 0 10px;

  :last-of-type {
    margin: 0 0 15px;
  }

  @media (${props => props.theme.mobile}) {
    width: 100%;
  }
`

export const Description = styled(Paragraph)`
  width: 50%;
  margin: 0 0 20px;
  color: ${props => props.theme.colors.gray};
  text-align: center;

  @media (${props => props.theme.media}) {
    width: 100%;
  }
`

export const Heading = styled(H1)`
  margin: 0 0 10px;
`
