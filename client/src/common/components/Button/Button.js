import styled from 'styled-components'

export const Button = styled.button`
  width: 100%;
  height: 50px;

  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};

  font-weight: 500;
  font-size: ${props => props.theme.fontSizes.medium};

  border-radius: 100px;

  cursor: pointer;
`
