import { ICollectionStakingSettings, IPool } from "./rplanet";
import { Sale } from "./am";

export interface ISaleWithStaking extends Sale {
  price_wax: number;
  /* aether per hour yield */
  staking_reward: number;
  /* aether per hour yield per wax*/
  staking_price_ratio: number;
  /*
   * aether per hour yield per wax invested.
   * If the asset is staked with pools then the
   * ratio will use the pool values to be calculated,
   * otherwiset (i.e. rplanet), it will use the
   * absolute per template_id reward
   **/
  reward_ratio: number;

  // TODO docs
  pool_staked?: number;
  pool_reward?: number;
  pool_per_share_reward?: number;
  pool_asset_reward?: number;
  pool_asset_reward_ratio?: number;
}

export function calcYield(
  sale: Sale,
  colStakingSettings: ICollectionStakingSettings,
  pool: IPool | undefined
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

  let poolScore: any;
  if (pool) {
    const staked = Number(pool.staked);
    const poolReward = Number(pool.fraction.split(" ")[0]);
    const perShareReward = poolReward / staked;
    // It looks like rplanet used the raw value to calculate
    // the shares of the pool
    const assetReward = stakingRewardRaw * perShareReward;
    const assetRewardRatio = assetReward / priceInWax;
    //console.log(
    //"staked, poolReward",
    //staked,
    //poolReward,
    //perShareReward,
    //assetReward,
    //assetRewardRatio
    //);
    poolScore = {
      pool_staked: staked,
      pool_reward: poolReward,
      pool_per_share_reward: perShareReward,
      pool_asset_reward: assetReward,
      pool_asset_reward_ratio: assetRewardRatio,
    };
  }

  const rewardRatio = pool
    ? poolScore.pool_asset_reward_ratio
    : stakingPriceRatio;
  //console.log("reward ratio", rewardRatio)

  return {
    ...sale,
    price_wax: priceInWax,
    staking_reward: stakingReward,
    staking_price_ratio: stakingPriceRatio,
    reward_ratio: rewardRatio,
    ...poolScore,
  };
}
