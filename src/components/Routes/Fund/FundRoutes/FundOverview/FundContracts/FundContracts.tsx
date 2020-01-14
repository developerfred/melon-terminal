import React from 'react';
import { useFundDetailsQuery } from '~/queries/FundDetails';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import { Block } from '~/storybook/components/Block/Block';
import { Grid, GridRow, GridCol } from '~/storybook/components/Grid/Grid';
import { SectionTitle } from '~/storybook/components/Title/Title';
import {
  Dictionary,
  DictionaryEntry,
  DictionaryLabel,
  DictionaryData,
} from '~/storybook/components/Dictionary/Dictionary';
import { EtherscanLink } from '~/components/Common/EtherscanLink/EtherscanLink';

export interface FundContractsProps {
  address: string;
}

export const FundContracts: React.FC<FundContractsProps> = ({ address }) => {
  const [fund, query] = useFundDetailsQuery(address);

  const contracts = [
    { name: 'Accounting', field: 'accounting' },
    { name: 'FeeManager', field: 'feeManager' },
    { name: 'Participation', field: 'participation' },
    { name: 'PolicyManager', field: 'policyManager' },
    { name: 'Shares', field: 'shares' },
    { name: 'Trading', field: 'trading' },
    { name: 'Vault', field: 'vault' },
    { name: 'Registry', field: 'registry' },
    { name: 'Version', field: 'version' },
    { name: 'PriceSource', field: 'priceSource' },
  ];

  const routes = fund?.routes;
  const addresses = contracts
    .map(contract => {
      const current = routes && ((routes as any)[contract.field] as any);
      return { ...contract, address: current && current.address };
    })
    .filter(item => !!item.address);

  return (
    <Dictionary>
      <SectionTitle>Fund contracts</SectionTitle>
      {query.loading && <Spinner />}

      {!query.loading &&
        addresses.map(a => (
          <DictionaryEntry key={a.address}>
            <DictionaryLabel>{a.name}</DictionaryLabel>
            <DictionaryData>
              <EtherscanLink address={a.address} />
            </DictionaryData>
          </DictionaryEntry>
        ))}
    </Dictionary>
  );
};
