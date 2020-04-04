import styled from 'styled-components'

export const Input = styled.input`
  width: 100%;
  padding: 15px 20px;

  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.black};

  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.small};

  border: 1px solid ${props => props.theme.colors.gray.light};
  border-radius: 100px;

  :focus {
    border: 1px solid ${props => props.theme.colors.primary.light};
  }

  ::placeholder {
    font-size: ${props => props.theme.fontSizes.small};
    color: ${props => props.theme.colors.gray.default};
  }
`
