import * as Rx from 'rxjs';
import { equals } from 'ramda';
import { Orderbook as OrderbookProvider } from '@0x/orderbook';
import { APIOrder as ZeroExOrder } from '@0x/types';
import { assetDataUtils } from '@0x/order-utils';
import { DeployedEnvironment, ExchangeIdentifier, TokenDefinition } from '@melonproject/melonjs';
import { catchError, concatMap, distinctUntilChanged, expand, map, tap } from 'rxjs/operators';
import { NetworkEnum } from '~/types';
import { Orderbook, OrderbookItem } from './aggregatedOrderbook';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';

export interface ZeroExOrderbookItem extends OrderbookItem {
  type: ExchangeIdentifier.ZeroExV2;
  order: ZeroExOrder;
}

function mapOrders(
  orders: ZeroExOrder[],
  makerAsset: TokenDefinition,
  takerAsset: TokenDefinition,
  side: 'bid' | 'ask'
) {
  return orders.map(order => {
    const quantity = fromTokenBaseUnit(order.order.makerAssetAmount, makerAsset.decimals);
    const price = fromTokenBaseUnit(order.order.takerAssetAmount, takerAsset.decimals).dividedBy(quantity);

    return {
      order,
      quantity,
      price,
      side,
      exchange: ExchangeIdentifier.ZeroExV2,
      id: `zeroex:${order.order.salt}`,
    } as OrderbookItem;
  });
}

export function zeroExOrderbook(
  environment: DeployedEnvironment,
  makerAsset: TokenDefinition,
  takerAsset: TokenDefinition
) {
  const network = environment.network as NetworkEnum;
  const makerAssetData = assetDataUtils.encodeERC20AssetData(makerAsset.address);
  const takerAssetData = assetDataUtils.encodeERC20AssetData(takerAsset.address);

  if (network !== NetworkEnum.MAINNET) {
    return Rx.EMPTY;
  }

  return Rx.using(
    () => {
      const provider = OrderbookProvider.getOrderbookForPollingProvider({
        httpEndpoint: 'https://api.0x.org/sra',
        pollingIntervalMs: 50000,
      });

      return {
        provider,
        unsubscribe: () => provider.destroyAsync(),
      };
    },
    resource => {
      const provider = (resource as any).provider as OrderbookProvider;

      const bids$ = Rx.defer(() => provider.getOrdersAsync(takerAssetData, makerAssetData)).pipe(
        catchError(() => Rx.of([]))
      );

      const asks$ = Rx.defer(() => provider.getOrdersAsync(makerAssetData, takerAssetData)).pipe(
        catchError(() => Rx.of([]))
      );

      const delay$ = Rx.timer(5000);
      const orders$ = Rx.combineLatest([bids$, asks$]);
      const polling$ = orders$.pipe(
        expand(() => delay$.pipe(concatMap(() => orders$))),
        distinctUntilChanged((a, b) => equals(a, b))
      );

      return polling$.pipe<Orderbook>(
        map(([b, a]) => ({
          bids: mapOrders(b, takerAsset, makerAsset, 'bid'),
          asks: mapOrders(a, makerAsset, takerAsset, 'ask'),
        }))
      );
    }
  );
}
