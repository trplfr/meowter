import styled from 'styled-components'

export const H1 = styled.h1`
  font-weight: ${props => props.theme.fontWeights.bold};
  font-size: ${props => props.theme.fontSizes.large};
  color: ${props => props.theme.colors.black};
`

export const H2 = styled.h2`
  font-weight: ${props => props.theme.fontWeights.medium};
  font-size: ${props => props.theme.fontSizes.medium};
  color: ${props => props.theme.colors.black};
`

export const H3 = styled.h3`
  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.small};
  color: ${props => props.theme.colors.black};
`

export const Paragraph = styled.p`
  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.small};
`

export const Phrase = styled.span`
  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.small};
`
