import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePriceFeedUpdateQuery } from '~/queries/PriceFeedUpdate';
import * as S from './Footer.styles';

export const Footer: React.FC = () => {
  const [update] = usePriceFeedUpdateQuery();

  return (
    <S.FooterPosition>
      <S.Footer>
        <S.FooterItem>
          <a href="https://melonprotocol.com">Protocol</a>
        </S.FooterItem>
        <S.FooterItem>
          <a href="https://docs.melonport.com">Documentation</a>
        </S.FooterItem>
        <S.FooterItem>
          <a href="https://github.com/Avantgarde-Finance/manager-interface/issues">Report an issue</a>
        </S.FooterItem>
        <S.FooterItem>
          <Link to="/playground/onchain">Network explorer</Link>
        </S.FooterItem>
        <S.FooterItem>
          <Link to="/playground/thegraph">Graph explorer</Link>
        </S.FooterItem>
        {update && <S.FooterItem>Last price feed update at {format(update, 'yyyy-MM-dd hh:mm a')}</S.FooterItem>}
      </S.Footer>
    </S.FooterPosition>
  );
};
