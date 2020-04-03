import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  padding: 20px 30px;

  button :not(:only-child) {
    margin: 0 0 20px 0;
  }
`
