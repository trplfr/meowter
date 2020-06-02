import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px 15px;
  border-bottom: ${props =>
    props.isBorder && `1px solid ${props.theme.colors.gray.light}`};
`

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 24px;
`
