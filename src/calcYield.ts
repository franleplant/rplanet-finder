import { ICollectionStakingSettings, IPool } from "./rplanet";
import { Sale } from "./am";

export interface ISaleWithStaking extends Sale {
  /* aether per hour yield */
  staking_reward: number;
  /* aether per hour yield per wax*/
  staking_price_ratio: number;

  // TODO docs
  pool_staked: number;
  pool_reward: number;
  pool_per_share_reward: number;
  pool_asset_reward: number;
  pool_asset_reward_ratio: number;
}

export function calcYield(
  sale: Sale,
  colStakingSettings: ICollectionStakingSettings,
  pool: IPool
): ISaleWithStaking {
  const asset = sale.assets[0];
  const rarityKey = colStakingSettings.rarity_id;
  const rarity = asset.data[rarityKey] || "";

  const rarityConf = colStakingSettings.rarities.find(
    (element) => element.rarity.toUpperCase() === rarity.toUpperCase()
  );

  const stakingRewardRaw = rarityConf?.one_asset_value || 0;
  // this is because this freaking thing comes shifted to the left
  const stakingReward = stakingRewardRaw / 10000;

  const priceInWax =
    sale.price.amount / Math.pow(10, sale.price.token_precision);
  const stakingPriceRatio = stakingReward / priceInWax;

  const staked = Number(pool.staked);
  const poolReward = Number(pool.fraction.split(" ")[0]);
  const perShareReward = poolReward / staked;
  const assetReward = stakingReward * perShareReward;
  const assetRewardRatio = assetReward / priceInWax;
  console.log(
    "staked, poolReward",
    staked,
    poolReward,
    perShareReward,
    assetReward,
    assetRewardRatio
  );

  return {
    ...sale,
    staking_reward: stakingReward,
    staking_price_ratio: stakingPriceRatio,
    pool_staked: staked,
    pool_reward: poolReward,
    pool_per_share_reward: perShareReward,
    pool_asset_reward: assetReward,
    pool_asset_reward_ratio: assetRewardRatio,
  };
}
