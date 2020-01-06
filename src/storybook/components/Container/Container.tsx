import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  display: block;
  width: 100%;
  margin: 0 auto;

  @media (${props => props.theme.mediaQueries.s}) {
    max-width: ${props => props.theme.container.s};
  }

  @media (${props => props.theme.mediaQueries.m}) {
    max-width: ${props => props.theme.container.m};
  }

  @media (${props => props.theme.mediaQueries.l}) {
    max-width: ${props => props.theme.container.l};
  }
`;