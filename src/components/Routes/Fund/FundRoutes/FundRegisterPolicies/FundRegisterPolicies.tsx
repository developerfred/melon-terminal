import React, { useState } from 'react';
import * as S from './FundRegisterPolicies.styles';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useFundPoliciesQuery } from '~/queries/FundPolicies';
import { FundPolicyParameters } from '../FundDetails/FundPolicies/FundPolicies';
import {
  PolicyManager,
  PriceTolerance,
  Deployment,
  MaxConcentration,
  MaxPositions,
  UserWhitelist,
  AssetWhitelist,
  AssetBlacklist,
  PolicyDefinition,
} from '@melonproject/melonjs';
import { useTransaction } from '~/hooks/useTransaction';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { PriceToleranceConfiguration } from './PriceToleranceConfiguration/PriceToleranceConfiguration';
import { MaxPositionsConfiguration } from './MaxPositionsConfiguration/MaxPositionsConfiguration';
import { MaxConcentrationConfiguration } from './MaxConcentrationConfiguration/MaxConcentrationConfiguration';
import { UserWhitelistConfiguration } from './UserWhitelistConfiguration/UserWhitelistConfiguration';
import { AssetWhitelistConfiguration } from './AssetWhitelistConfiguration/AssetWhitelistConfiguration';
import { AssetBlacklistConfiguration } from './AssetBlacklistConfiguration/AssetBlacklistConfiguration';
import { useAccount } from '~/hooks/useAccount';
import { useOnChainQueryRefetcher } from '~/hooks/useOnChainQueryRefetcher';
import { Grid, GridRow, GridCol } from '~/storybook/components/Grid/Grid';
import { Block } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';

export interface RegisterPoliciesProps {
  address: string;
}

export const RegisterPolicies: React.FC<RegisterPoliciesProps> = ({ address }) => {
  const environment = useEnvironment()!;
  const account = useAccount()!;
  const refetch = useOnChainQueryRefetcher();
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDefinition>();
  const [policyManager] = useFundPoliciesQuery(address);

  const transaction = useTransaction(environment, {
    onAcknowledge: receipt => {
      if (receipt.contractAddress && selectedPolicy) {
        const manager = new PolicyManager(environment, policyManager!.address);

        const signatures = selectedPolicy.signatures;
        const addresses = Array.from(Array(selectedPolicy.signatures.length).keys()).map(
          () => receipt.contractAddress!
        );

        const tx = manager.batchRegisterPolicies(account.address!, signatures, addresses);
        transaction.start(tx, `Register ${selectedPolicy.name} policy`);
      }
    },
    onFinish: () => refetch(),
  });

  const policies = policyManager?.policies || [];
  const startTransaction = (
    tx: Deployment<PriceTolerance | MaxPositions | MaxConcentration | UserWhitelist | AssetWhitelist | AssetBlacklist>,
    name: string
  ) => transaction.start(tx, name);

  return (
    <Grid>
      <GridRow justify="center">
        <GridCol xs={12} sm={6} md={4} lg={4}>
          <Block>
            <SectionTitle>Risk profile</SectionTitle>
            <p>
              Configure the risk management profile of your fund and the rules to be enforced by the smart contracts.
            </p>
            <p>&nbsp;</p>

            <SectionTitle>Available policies ({environment.policies.length})</SectionTitle>
            <p>Please select the policy that you want to add:</p>
            <ul>
              {environment.policies.map(policy => {
                return (
                  <li key={policy.name}>
                    <input type="radio" id={policy.name} name="addPolicy" onClick={() => setSelectedPolicy(policy)} />
                    <label htmlFor={policy.name}>{policy.name}</label>
                  </li>
                );
              })}
            </ul>
            <p>&nbsp;</p>

            {policyManager && selectedPolicy && selectedPolicy.id === 'priceTolerance' && (
              <PriceToleranceConfiguration
                policyManager={policyManager.address!}
                policy={selectedPolicy}
                startTransaction={startTransaction}
              />
            )}

            {policyManager && selectedPolicy && selectedPolicy.id === 'maxPositions' && (
              <MaxPositionsConfiguration
                policyManager={policyManager.address!}
                policy={selectedPolicy}
                startTransaction={startTransaction}
              />
            )}

            {policyManager && selectedPolicy && selectedPolicy.id === 'maxConcentration' && (
              <MaxConcentrationConfiguration
                policyManager={policyManager.address!}
                policy={selectedPolicy}
                startTransaction={startTransaction}
              />
            )}

            {policyManager && selectedPolicy && selectedPolicy.id === 'userWhitelist' && (
              <UserWhitelistConfiguration
                policyManager={policyManager.address!}
                policy={selectedPolicy}
                startTransaction={startTransaction}
              />
            )}

            {policyManager && selectedPolicy && selectedPolicy.id === 'assetWhitelist' && (
              <AssetWhitelistConfiguration
                policyManager={policyManager.address!}
                policy={selectedPolicy}
                startTransaction={startTransaction}
              />
            )}

            {policyManager && selectedPolicy && selectedPolicy.id === 'assetBlacklist' && (
              <AssetBlacklistConfiguration
                policyManager={policyManager.address!}
                policy={selectedPolicy}
                startTransaction={startTransaction}
              />
            )}

            <p>&nbsp;</p>

            <SectionTitle>Active policies ({policies.length})</SectionTitle>
            {policies.length ? (
              <S.Table>
                <thead>
                  <S.HeaderRow>
                    <S.HeaderCell>Name</S.HeaderCell>
                    <S.HeaderCell>Parameter(s)</S.HeaderCell>
                  </S.HeaderRow>
                </thead>
                <tbody>
                  {policies.map(policy => (
                    <S.BodyRow key={policy.address}>
                      <S.BodyCell>{policy.identifier}</S.BodyCell>
                      <FundPolicyParameters policy={policy} environment={environment} />
                    </S.BodyRow>
                  ))}
                </tbody>
              </S.Table>
            ) : (
              <S.NoRegisteredPolicies>No registered policies.</S.NoRegisteredPolicies>
            )}

            <TransactionModal transaction={transaction} />
          </Block>
        </GridCol>
      </GridRow>
    </Grid>
  );
};

export default RegisterPolicies;
