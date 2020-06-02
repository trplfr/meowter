import styled from 'styled-components'

import { H1, H3 } from 'core/styles/typography'

import hello from 'assets/images/cats/hello.png'

export const Screen = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`

export const Left = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 100%;

  @media (${props => props.theme.media.mobile}) {
    width: 100%;
  }
`

export const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 100%;

  @media (${props => props.theme.media.mobile}) {
    display: none;
  }
`

export const Heading = styled(H1)`
  margin: 0 0 10px;

  @media (${props => props.theme.media.desktop}) {
    font-size: ${props => props.theme.fontSizes.huge};
  }
`

export const Description = styled(H3)`
  width: 50%;
  margin: 0;
  color: ${props => props.theme.colors.gray.default};
  text-align: center;
  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.medium};

  @media (${props => props.theme.media.mobile}) {
    width: 100%;
    font-size: ${props => props.theme.fontSizes.small};
  }
`

export const Cat = styled.div`
  width: 185px;
  height: 135px;
  margin: 0 0 20px 0;
  background: url('${hello}');
`
