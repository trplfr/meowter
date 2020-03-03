import styled from 'styled-components'

import { H1 } from 'core/styles/typography'

export const Screen = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`

export const Left = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 100%;

  @media (${props => props.theme.media.mobile}) {
    display: none;
  }
`

export const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 100%;

  @media (${props => props.theme.media.mobile}) {
    width: 100%;
  }
`

export const Title = styled(H1)`
  font-size: ${props => props.theme.fontSizes.huge};
`
