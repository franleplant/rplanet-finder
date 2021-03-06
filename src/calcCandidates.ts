import {
  ICollectionStakingSettingsDict,
  ICollectionStakingSettings,
  IPoolDict,
  IPool,
} from "./rplanet";
import { getSales, ISaleParams, Sale } from "./am";
import { calcYield, ISaleWithStaking } from "./calcYield";
import { IFlags } from "./cli";

export interface ISale extends ISaleWithStaking {
  url: string;
}

export interface IArgs {
  sales: Array<Sale>;
  stakingSettings: ICollectionStakingSettingsDict;
  pools: IPoolDict;
  flags: IFlags;
}

export default async function calcCandidates({
  sales,
  stakingSettings,
  pools,
  flags,
}: IArgs): Promise<Array<ISale>> {
  const salesWithStaking = sales
    .filter((sale) => sale.assets.length === 1)
    // calculate the colStakingSettings
    .map((sale) => {
      const [asset] = sale.assets;
      const collectionName = asset.collection.collection_name;
      const schemaName = asset.schema.schema_name;
      const colSettings = stakingSettings?.[collectionName];
      const schemaSettings = colSettings?.[schemaName];

      const pool = pools[collectionName];

      //console.log(collectionName, schemaName, pool, schemaSettings);
      return [sale, schemaSettings, pool] as [
        Sale,
        ICollectionStakingSettings | undefined,
        IPool | undefined
      ];
    })
    // omit sale/assets that are not stakable in rplanet
    .filter(([_sale, colStakingSettings, _pool]) => !!colStakingSettings)
    .map(([sale, colStakingSettings, pool]) =>
      calcYield(sale, colStakingSettings!, pool)
    )
    .map((sale) => ({
      ...sale,
      url: `https://wax.atomichub.io/market/sale/${sale.sale_id}`,
    }))
    .filter((sale) => sale.reward_ratio >= flags.yield)
    .sort((saleA, saleB) => saleB.reward_ratio - saleA.reward_ratio)
    .map((sale) => sale);

  return salesWithStaking;
}
