import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';
import { useOnChainQuery } from '~/hooks/useQuery';
import { Maybe } from '~/types';

export interface AccountBalances {
  eth: BigNumber;
  weth: BigNumber;
}

export interface AccountBalancesQueryResult {
  account: AccountBalances;
}

const AccountBalancesQuery = gql`
  query AccountBalancesQuery {
    account {
      eth: balance(token: ETH)
      weth: balance(token: WETH)
    }
  }
`;

export const useAccountBalancesQuery = () => {
  const result = useOnChainQuery<AccountBalancesQueryResult>(AccountBalancesQuery);
  return [result.data && result.data.account, result] as [Maybe<AccountBalances>, typeof result];
};