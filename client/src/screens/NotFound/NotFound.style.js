import styled from 'styled-components'
import { H1, H3 } from 'core/styles/typography'

import image from 'assets/images/cats/notfound.png'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

export const Cat = styled.div`
  width: 179px;
  height: 287px;
  margin: 0 0 20px 0;
  background: url('${image}');
`

export const Heading = styled(H1)`
  margin: 0 0 10px;
`

export const Description = styled(H3)`
  width: 50%;
  margin: 0 0 20px;
  color: ${props => props.theme.colors.gray};
  text-align: center;
  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.small};

  @media (${props => props.theme.media.mobile}) {
    width: 100%;
  }
`
