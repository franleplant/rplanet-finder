import fs from "fs";
import { flatten } from "lodash";
import chalk from "chalk";
import { getSales, ISaleParams, SortOrder } from "./am";
import {
  getPools,
  getSettings,
  ICollectionStakingSettingsDict,
  IPoolDict,
} from "./rplanet";
import calcCandidates, { ISale } from "./calcCandidates";
import { notify } from "./notify";
import { openBrowser } from "./openBrowser";
import { logCandidates } from "./log";
import timeout from "./timeout";
import { IFlags } from "./cli";

const MAX_WAIT_TIME = 30;
const MIN_WAIT_TIME = 1;
const LOG_FILE = "log";

export default async function rpfinder(flags: IFlags): Promise<void> {
  console.log(chalk.magenta(`Check the logs by: tail -f ${LOG_FILE}`));
  console.log(chalk.magenta("Using flags", JSON.stringify(flags)));
  const stream = fs.createWriteStream(LOG_FILE, { flags: "a" });
  setCleanup(stream);

  let wait = 1;

  const stakingSettings = await getSettings();
  const pools = await getPools();

  const collections = Object.keys(stakingSettings);
  const saleParams = getSaleParams(flags, collections);

  while (true) {
    process.stdout.write("F");
    try {
      const candidates = await fetchCandidates({
        saleParams,
        stakingSettings,
        pools,
        flags,
      });
      process.stdout.write((candidates?.length || 0).toString());
      wait = Math.max(wait / 2, MIN_WAIT_TIME);

      logCandidates(stream, candidates);
      if (flags.notify) {
        notify(candidates);
      }
      if (flags.open) {
        openBrowser(candidates);
      }
    } catch (err) {
      console.error(err);
      wait = Math.min(wait * 2, MAX_WAIT_TIME);
    }
    process.stdout.write(`W${wait}`);
    await timeout(wait);
    process.stdout.write("..");
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
  const pages = await Promise.all([
    getSales({ ...saleParams } as any, 1),
    getSales({ ...saleParams } as any, 2),
  ]);

  const sales = flatten(pages);

  return calcCandidates({ sales, stakingSettings, pools, flags });
}

export function setCleanup(log: fs.WriteStream): void {
  const cleanup = () => {
    console.log(chalk.magenta("cleaning up"));
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
    max_assets: 1,
    min_assets: 1,
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

  if (flags.asset) {
    params.asset_id = flags.asset;
  }

  if (flags.max_price) {
    params.max_price = flags.maxPrice;
  }

  console.log(chalk.magenta("Using sale params", JSON.stringify(params)));
  return params;
}
