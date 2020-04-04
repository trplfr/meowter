import styled from 'styled-components'

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 50px;

  background: ${props =>
    props.isLoading
      ? props.theme.colors.primary.disabled
      : props.theme.colors.primary.default};
  color: ${props => props.theme.colors.white};

  font-weight: 500;
  font-size: ${props => props.theme.fontSizes.medium};

  border-radius: 100px;

  cursor: ${props => (props.isLoading ? 'default' : 'pointer')};

  :hover {
    background: ${props =>
      props.isLoading
        ? props.theme.colors.primary.disabled
        : props.theme.colors.primary.hover};
  }

  :active {
    background: ${props => props.theme.colors.primary.active};
  }

  :disabled {
    background: ${props => props.theme.colors.primary.disabled};
  }

  svg {
    margin: 0 5px 0 0;
  }
`
