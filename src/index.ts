import fs from "fs";
import { flatten } from "lodash";
import { ISaleParams, SortOrder } from "./am";
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
import { IFlags } from "./cli";

const MAX_WAIT_TIME = 30;
const MIN_WAIT_TIME = 1;
const LOG_FILE = "log";

export default async function rpfinder(flags: IFlags): Promise<void> {
  console.log(`check the logs by: tail -f ${LOG_FILE}`);
  console.log("using flags", JSON.stringify(flags));
  const stream = fs.createWriteStream(LOG_FILE, { flags: "a" });
  setCleanup(stream);

  let wait = 1;

  const stakingSettings = await getSettings();
  const pools = await getPools();

  const collections = Object.keys(stakingSettings);
  const saleParams = getSaleParams(flags, collections);

  while (true) {
    console.log("start");
    console.log("fetching...");
    try {
      const candidates = await fetchCandidates({
        saleParams,
        stakingSettings,
        pools,
        flags,
      });
      wait = Math.max(wait / 2, MIN_WAIT_TIME);

      logCandidates(stream, candidates);
      if (flags.notify) {
        notify(candidates);
      }
      if (flags.notify) {
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

export async function fetchCandidates({
  saleParams,
  stakingSettings,
  pools,
  flags,
}: {
  saleParams: ISaleParams;
  stakingSettings: ICollectionStakingSettingsDict;
  pools: IPoolDict;
  flags: IFlags;
}): Promise<Array<ISale>> {
  const params = {
    stakingSettings,
    saleParams: { ...saleParams },
    pools,
    flags,
  };

  const pages = await Promise.all([
    fetchCandidatesPage({ ...params, pageNumber: 1 }),
    fetchCandidatesPage({ ...params, pageNumber: 2 }),
  ]);

  return flatten(pages);
}

export function setCleanup(log: fs.WriteStream): void {
  const cleanup = () => {
    console.log("cleaning up");
    log.end();
    process.exit(0);
  };
  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
}

export function getSaleParams(
  flags: IFlags,
  collections: Array<string>
): ISaleParams {
  const params: ISaleParams = {
    sort: "updated",
    order: SortOrder.Desc,
    symbol: "WAX",
    collection_blacklist: ["alien.worlds", "kennbosakgif"],
    collection_whitelist: collections,
  };

  if (flags.template) {
    params.template_id = flags.template;
  }

  if (flags.collection) {
    params.collection_whitelist = [flags.collection];
  }

  console.log("Using sale params", JSON.stringify(params));
  return params;
}
