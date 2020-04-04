import styled from 'styled-components'

import { Button, Input } from 'common/components'
import { H1, H3 } from 'core/styles/typography'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

export const Accept = styled(Button)`
  width: 50%;

  @media (${props => props.theme.media.mobile}) {
    width: 100%;
  }

  :nth-of-type(1) {
    margin: 0 0 10px;
  }
`

export const Field = styled(Input)`
  width: 50%;
  margin: 0 0 10px;

  :last-of-type {
    margin: 0 0 15px;
  }

  @media (${props => props.theme.media.mobile}) {
    width: 100%;
  }
`

export const Heading = styled(H1)`
  margin: 0 0 10px;
`

export const Description = styled(H3)`
  width: 50%;
  margin: 0 0 20px;
  color: ${props => props.theme.colors.gray.default};
  text-align: center;
  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.small};

  @media (${props => props.theme.media.mobile}) {
    width: 100%;
  }
`
