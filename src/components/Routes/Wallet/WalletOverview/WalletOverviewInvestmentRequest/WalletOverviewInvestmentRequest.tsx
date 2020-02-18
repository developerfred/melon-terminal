import React from 'react';
import { Participation } from '@melonproject/melonjs';
import { InvestmentRequest } from '~/components/Routes/Wallet/WalletOverview/FundParticipationOverview.query';
import { BodyCell, BodyRow, BodyCellRightAlign } from '~/storybook/components/Table/Table';
import { FormattedDate } from '~/components/Common/FormattedDate/FormattedDate';
import { useInvestmentRequestStatusQuery } from '~/components/Routes/Wallet/WalletOverview/WalletOverviewInvestmentRequest/InvestmentRequestStatus.query';
import { Button } from '~/storybook/components/Button/Button.styles';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useAccount } from '~/hooks/useAccount';
import { useTransaction } from '~/hooks/useTransaction';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { TokenValue } from '~/components/Common/TokenValue/TokenValue';

export const WalletOverviewInvestmentRequest: React.FC<InvestmentRequest> = props => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const [status, query] = useInvestmentRequestStatusQuery(props.account!, props.address);

  const transaction = useTransaction(environment);

  const execute = () => {
    const contract = new Participation(environment, status?.address!);
    const tx = contract.executeRequestFor(account.address!, account.address!);
    transaction.start(tx, 'Execute investment request');
  };

  const cancel = () => {
    const participationAddress = status?.address;
    const participationContract = new Participation(environment, participationAddress);
    const tx = participationContract.cancelRequest(account.address!);
    transaction.start(tx, 'Cancel investment request');
  };

  const buttonAction = () => {
    if (status?.canCancelRequest) {
      return (
        <Button type="button" id="action" onClick={() => cancel()}>
          Cancel investment request
        </Button>
      );
    }

    if (status?.investmentRequestState === 'VALID') {
      return (
        <Button type="button" onClick={() => execute()}>
          Execute investment request
        </Button>
      );
    }

    if (status?.investmentRequestState === 'WAITING') {
      return <>Waiting for execution window</>;
    }

    return <></>;
  };

  return (
    <>
      <BodyRow>
        <BodyCell>{props.name}</BodyCell>
        <BodyCell>
          <FormattedDate timestamp={props.requestCreatedAt} />
        </BodyCell>
        <BodyCell>{props.requestAsset}</BodyCell>
        <BodyCellRightAlign>
          <TokenValue value={props.requestAmount}></TokenValue>
        </BodyCellRightAlign>
        <BodyCellRightAlign>
          <TokenValue value={props.requestShares}></TokenValue>
        </BodyCellRightAlign>
        <BodyCell>{!query.loading && buttonAction()}</BodyCell>
      </BodyRow>
      <TransactionModal transaction={transaction} />
    </>
  );
};
