import fs from "fs";
import { flatten } from "lodash";
import { SaleParams, SortOrder } from "./am";
import {
  getPools,
  getSettings,
  ICollectionStakingSettingsDict,
  IPoolDict,
} from "./rplanet";
import fetchCandidatesPage, { ISale } from "./fetchCandidates";
import { notify } from "./notify";
import { openBrowser } from "./openBrowser";
import { logCandidates } from "./log";
import timeout from "./timeout";
import { params } from "./params";

const saleParams: SaleParams = {
  // TODO type information looks outdated
  sort: "updated" as any,
  order: SortOrder.Desc,
  symbol: "WAX",
  collection_blacklist: ["alien.worlds", "kennbosakgif"],
  collection_whitelist: [],
  // TODO this field should not be here if TEMPLATE is undefined
  //template_id: params.TEMPLATE,
} as any;

export async function fetchCandidates(
  otherSaleParams: any,
  stakingSettings: ICollectionStakingSettingsDict,
  pools: IPoolDict
): Promise<Array<ISale>> {
  const pages = await Promise.all([
    fetchCandidatesPage({
      pageNumber: 1,
      stakingSettings,
      saleParams: { ...saleParams, ...otherSaleParams },
      pools,
    }),
    fetchCandidatesPage({
      pageNumber: 2,
      stakingSettings,
      saleParams: { ...saleParams, ...otherSaleParams },
      pools,
    }),
  ]);

  return flatten(pages);
}

async function main(): Promise<void> {
  const stream = fs.createWriteStream("log", { flags: "a" });
  const cleanup = () => {
    console.log("cleaning up");
    stream.end();
    process.exit(0);
  };
  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);

  let wait = 1;
  const MAX_WAIT_TIME = 30;
  const MIN_WAIT_TIME = 1;

  const stakingSettings = await getSettings();
  const pools = await getPools();

  let collectionWhitelist = Object.keys(stakingSettings);
  if (params.COLLECTION) {
    collectionWhitelist = [params.COLLECTION];
  }
  console.log(
    "only looking for the following collections",
    JSON.stringify(collectionWhitelist)
  );

  while (true) {
    console.log("start");
    console.log("fetching...");
    try {
      const candidates = await fetchCandidates(
        { collection_whitelist: collectionWhitelist },
        stakingSettings,
        pools
      );
      wait = Math.max(wait / 2, MIN_WAIT_TIME);

      logCandidates(stream, candidates);
      if (params.NOTIFY) {
        notify(candidates);
      }
      if (params.OPEN) {
        openBrowser(candidates);
      }
    } catch (err) {
      console.error(err);
      wait = Math.min(wait * 2, MAX_WAIT_TIME);
    }
    console.log(`waiting ${wait} seconds...`);
    await timeout(wait);
    console.log("done");
    console.log("===========");
  }
}

main().then(console.log, console.error);
