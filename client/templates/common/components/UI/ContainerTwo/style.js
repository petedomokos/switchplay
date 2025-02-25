import styled, { css } from 'styled-components';

const ContainerWrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
      max-width: none !important;
    `};
  ${(props) =>
    (props.noGutter &&
      css`
        padding-left: 0;
        padding-right: 0;
      `) ||
    css`
      padding-left: 30px;
      padding-right: 30px;
    `};
  @media (min-width: 768px) {
    max-width: 850px;
    width: 100%;
  }
  @media (min-width: 990px) {
    max-width: 970px;
    width: 100%;
  }

  @media (min-width: 990px) {
    max-width: ${(props) => props.width || '1170px'};
    padding: 0;
  }
  @media (min-width: 1400px) {
    padding: 0;
    max-width: ${(props) => props.width || '1300px'};
    width: 100%;
  }
  @media (max-width: 768px) {
    ${(props) =>
      props.mobileGutter &&
      css`
        padding-left: 30px;
        padding-right: 30px;
      `};
  }
  &.for-signed-in-user {
    padding: 0;
    margin:0;
    width:100%;
    min-width: 100%;
  }
`;

export default ContainerWrapper;
