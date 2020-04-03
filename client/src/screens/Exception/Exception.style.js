import styled from 'styled-components'
import { H1, H3 } from 'core/styles/typography'

import notfound from 'assets/images/cats/notfound.png'
import error from 'assets/images/cats/error.png'
import credentials from 'assets/images/cats/credentials.png'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

export const NotFoundCat = styled.div`
  width: 179px;
  height: 287px;
  margin: 0 0 20px 0;
  background: url('${notfound}');
`

export const ErrorCat = styled.div`
  width: 228px;
  height: 303px;
  margin: 0 0 20px 0;
  background: url('${error}');
`

export const NotLoggedInCat = styled.div`
  width: 231px;
  height: 325px;
  margin: 0 0 20px 0;
  background: url('${credentials}');
`

export const Heading = styled(H1)`
  margin: 0 0 10px;
`

export const Description = styled(H3)`
  width: 50%;
  margin: 0;
  color: ${props => props.theme.colors.gray};
  text-align: center;
  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.small};

  @media (${props => props.theme.media.mobile}) {
    width: 100%;
  }
`

export const Details = styled.details`
  margin: 10px 0 0 0;
  white-space: pre-wrap;
`
