import fetch from "node-fetch";
import { groupBy, keyBy, Dictionary } from "lodash";

// TODO move to env
const URL = "https://chain.wax.io/v1/chain/get_table_rows";

export interface IResponse {
  next_key: string;
  more: boolean;
  rows: Array<ICollectionStakingSettings>;
}

export interface ICollectionStakingSettings {
  id: string;
  contract: string;
  author: string;
  collection: string;
  schema: string;
  name_id: string;
  img_id: string;
  /**
   * the value of this key will be used to look for
   * the rarity of the assets, by doing the following
   * asset.data[rarity_id]
   */
  rarity_id: string;
  rarities: Array<IRarity>;
  r1: number;
  r2: number;
  r3: number;
}

export interface IRarity {
  rarity: string;
  uniq_assets: number;
  one_asset_value: number;
  collection_value: number;
  r1: number;
  r2: number;
}

/**
 * Get the staking configurations in rplanet. This will
 * be used later to cross reference it with the open listed
 * nfts and calculate the ROI of each nft based off its market price
 * and staking rewards.
 */
export async function getStakingSettings(): Promise<IResponse> {
  const res = await fetch(URL, {
    method: "POST",
    body: JSON.stringify({
      json: true,
      code: "s.rplanet",
      scope: "s.rplanet",
      table: "collections",
      lower_bound: "",
      upper_bound: "",
      index_position: 1,
      key_type: "i64",
      limit: 1000,
      reverse: false,
      show_payer: false,
    }),
  });
  //console.log(await res.clone().text())
  const data = (await res.json()) as IResponse;

  if (data.more) {
    console.log("WARN: we got more settings to fetch");
  }

  return data;
}

export type ICollectionStakingSettingsDict = Dictionary<
  Dictionary<ICollectionStakingSettings>
>;

export async function getStakingSettingsDict(): Promise<ICollectionStakingSettingsDict> {
  const {rows} = await getStakingSettings();

  const byCollection = groupBy(rows, "collection");

  const stakingSettings: Dictionary<Dictionary<ICollectionStakingSettings>> =
    {};

  Object.entries(byCollection).forEach(([collectionName, settings]) => {
    const bySchema = keyBy(settings, "schema");
    stakingSettings[collectionName] = bySchema;
  });

  return stakingSettings;
}
