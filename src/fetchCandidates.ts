import {
  ICollectionStakingSettingsDict,
  ICollectionStakingSettings,
} from "./rplanet";
import { getSales, SaleParams, Sale } from "./am";
import { calcYield, ISaleWithStaking } from "./calcYield";

export interface IArgs {
  pageNumber: number;
  stakingSettings: ICollectionStakingSettingsDict;
  saleParams: SaleParams;
}

export interface ISale extends ISaleWithStaking {
  url: string;
}

export default async function fetchCandidates({
  pageNumber = 1,
  stakingSettings,
  saleParams,
}: IArgs): Promise<Array<ISale>> {
  const YIELD_THRESHOLD = process.env.YIELD_THRESHOLD || 0.5;

  const sales = await getSales({ ...saleParams }, pageNumber, 100);

  const salesWithStaking = sales
    .filter((sale) => sale.assets.length === 1)
    // calculate the colStakingSettings
    .map((sale) => {
      const [asset] = sale.assets;
      const collectionName = asset.collection.collection_name;
      const schemaName = asset.schema.schema_name;
      const colSettings = stakingSettings[collectionName];
      const schemaSettings = colSettings[schemaName];
      return [sale, schemaSettings] as [
        Sale,
        ICollectionStakingSettings | undefined
      ];
    })
    // omit sale/assets that are not stakable in rplanet
    .filter(([_sale, colStakingSettings]) => !!colStakingSettings)
    .map(([sale, colStakingSettings]) => calcYield(sale, colStakingSettings!))
    .map((sale) => ({
      ...sale,
      url: `https://wax.atomichub.io/market/sale/${sale.sale_id}`,
    }))
    .filter((sale) => sale.staking_price_ratio >= YIELD_THRESHOLD)
    .sort(
      (saleA, saleB) => saleB.staking_price_ratio - saleA.staking_price_ratio
    )
    .map((sale) => sale);

  return salesWithStaking;
}
