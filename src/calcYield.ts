import { ICollectionStakingSettings } from "./rplanet";
import { Sale } from "./am";

export interface ISaleWithStaking extends Sale {
  /* aether per hour yield */
  staking_reward: number;
  /* aether per hour yield per wax*/
  staking_price_ratio: number;
}

export function calcYield(
  sale: Sale,
  colStakingSettings: ICollectionStakingSettings
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
  //console.log("staklingPriceRatio", stakingPriceRatio, priceInWax)
  return {
    ...sale,
    staking_reward: stakingReward,
    staking_price_ratio: stakingPriceRatio,
  };
}
