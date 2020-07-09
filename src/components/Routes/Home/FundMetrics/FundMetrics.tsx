import React, { useState } from 'react';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useTokenRates } from '~/components/Contexts/Rates/Rates';
import { useFundMetricsQuery } from '~/components/Routes/Home/FundMetrics/FundMetrics.query';
import { Grid, GridCol, GridRow } from '~/storybook/Grid/Grid';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { SectionTitle } from '~/storybook/Title/Title';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';
import { Block } from '~/storybook/Block/Block';

import styled from 'styled-components';
import { useHistory } from 'react-router';
import { Tooltip } from '~/storybook/Tooltip/Tooltip';
import { Button } from '~/components/Form/Button/Button';

export const MetricsAUM = styled.div`
  width: 100%;
  text-align: center;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  font-size: ${(props) => props.theme.fontSizes.xxxl};
  color: rgb(133, 213, 202);
  cursor: pointer;
  margin-top: 10px;
`;

export const MetricsOthers = styled.div`
  width: 100%;
  text-align: center;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  font-size: ${(props) => props.theme.fontSizes.xxl};
  color: rgb(133, 213, 202);
  margin-top: 13px;
`;

export const MetricsText = styled.div`
  width: 100%;
  text-align: center;
  font-weight: ${(props) => props.theme.fontWeights.regular};
  font-size: ${(props) => props.theme.fontSizes.xl};
  color: ${(props) => props.theme.mainColors.textColor};
`;

export const FundMetrics: React.FC = () => {
  const [metrics, metricsQuery] = useFundMetricsQuery();
  const [currency, setCurrency] = useState('USD');
  const rates = useTokenRates('ETH');
  const history = useHistory();

  if (metricsQuery.loading || !metrics) {
    return (
      <>
        <Block>
          <SectionTitle>Network Metrics</SectionTitle>
          <Spinner />
        </Block>
      </>
    );
  }

  const networkGav = fromTokenBaseUnit(metrics.state?.networkGav, 18);

  const activeFunds = metrics.state?.activeFunds;
  const nonActiveFunds = metrics.state?.nonActiveFunds;
  const allInvestments = metrics.state?.allInvestments;

  const mlnPrice = networkGav.multipliedBy(rates.USD);

  return (
    <Block>
      <SectionTitle>
        Network Metrics <a href="https://monitoring.melon.network">Melon Monitoring...</a>
      </SectionTitle>
      <Grid>
        <GridRow>
          <GridCol xs={12} sm={12}>
            {currency === 'USD' ? (
              <MetricsAUM onClick={() => setCurrency('ETH')}>
                <FormattedNumber value={mlnPrice} decimals={0} prefix="$" />
              </MetricsAUM>
            ) : (
              <MetricsAUM onClick={() => setCurrency('USD')}>
                <FormattedNumber value={networkGav} decimals={0} prefix="Ξ" />
              </MetricsAUM>
            )}

            <MetricsText>Assets Managed</MetricsText>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol xs={12} sm={6}>
            <MetricsOthers>{parseInt(activeFunds ?? '0', 10) + parseInt(nonActiveFunds ?? '0', 10)}</MetricsOthers>
            <MetricsText>Funds</MetricsText>
          </GridCol>
          <GridCol xs={12} sm={6}>
            <MetricsOthers>{parseInt(allInvestments ?? '0', 10)}</MetricsOthers>
            <MetricsText>Investments</MetricsText>
          </GridCol>
        </GridRow>
      </Grid>
    </Block>
  );
};
