import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  svg {
    position: absolute;
    top: 12px;
    right: 15px;
    cursor: pointer;

    path {
      fill: ${props =>
        props.isEyeActive
          ? props.theme.colors.primary.active
          : props.theme.colors.gray.default};
    }

    :hover {
      path {
        fill: ${props => props.theme.colors.primary.active};
      }
    }
  }
`

export const Input = styled.input`
  width: 100%;
  padding: 15px 20px;

  background: ${props => props.theme.colors.white};
  color: ${props =>
    props.hasError ? props.theme.colors.error : props.theme.colors.black};

  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.small};

  border: 1px solid
    ${props =>
      props.hasError
        ? props.theme.colors.error
        : props.theme.colors.gray.light};

  border-radius: 100px;

  :focus {
    border: 1px solid
      ${props =>
        props.hasError
          ? props.theme.colors.error
          : props.theme.colors.primary.light};
  }

  ::placeholder {
    font-size: ${props => props.theme.fontSizes.small};
    color: ${props => props.theme.colors.gray.default};
  }
`

export const Error = styled.label`
  display: flex;
  position: absolute;
  bottom: 42px;
  left: 25px;
  align-items: center;
  justify-content: center;
  width: auto;
  padding: 0 2px;
  background: white;
  font-size: 10px;
  color: ${props => props.theme.colors.error};
`
