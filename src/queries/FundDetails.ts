import gql from 'graphql-tag';
import BigNumber from 'bignumber.js';
import { useOnChainQuery } from '~/hooks/useQuery';

export interface FundDetails {
  name: string;
  manager: string;
  creationTime: Date;
  isShutDown: boolean;
  routes: {
    accounting?: {
      address: string;
      sharePrice: BigNumber;
      grossAssetValue: BigNumber;
    };
    feeManager?: {
      address: string;
      managementFeeAmount: BigNumber;
      performanceFeeAmount: BigNumber;
      managementFee?: {
        rate: BigNumber;
      };
      performanceFee?: {
        rate: BigNumber;
        period: number;
        canUpdate: boolean;
      };
    };
  };
}

export interface AccountDetails {
  shares: {
    balanceOf: BigNumber;
  };
}

export interface FundDetailsQueryVariables {
  fund: string;
}

const FundDetailsQuery = gql`
  query FundDetailsQuery($fund: Address!) {
    fund(address: $fund) {
      name
      manager
      creationTime
      isShutDown
      routes {
        accounting {
          address
          grossAssetValue
          sharePrice
        }
        feeManager {
          address
          managementFeeAmount
          performanceFeeAmount
          managementFee {
            rate
          }
          performanceFee {
            rate
            period
            canUpdate
          }
        }
      }
    }
  }
`;

export const useFundDetailsQuery = (fund: string) => {
  const options = {
    variables: { fund },
  };

  const result = useOnChainQuery<FundDetailsQueryVariables>(FundDetailsQuery, options);
  return [result.data?.fund, result] as [FundDetails | undefined, typeof result];
};
