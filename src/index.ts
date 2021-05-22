import util from "util";
import { exec as execRaw } from "child_process";
import fs from "fs";
import notifier from "node-notifier";
import { flatten, memoize } from "lodash";
import { SaleParams, SortOrder } from "./am";
import { getSettings, ICollectionStakingSettingsDict, } from "./rplanet";
import fetchCandidatesPage, { ISale } from "./fetchCandidates";

const exec = util.promisify(execRaw);

const saleParams: SaleParams = {
  // TODO type information looks outdated
  sort: "updated" as any,
  order: SortOrder.Desc,
  symbol: "WAX",
  collection_blacklist: ["alien.worlds", "kennbosakgif"],
} as any;

export function timeout(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function notifySale(sale: ISale): void {
  console.log("notifiying", sale.sale_id);
  notifier.notify({
    title: `New High Yield NFT found ${sale.sale_id}`,
    message: sale.url,
    open: sale.url,
  });
}

const memoizedNotifySale = memoize(notifySale, (sale) => sale.sale_id);

export function notify(sales: Array<ISale>): void {
  if (sales.length === 0) {
    return;
  }

  console.log("notifying");

  for (const sale of sales) {
    memoizedNotifySale(sale);
  }
}

const memoizedOpen = memoize((url: string) => exec(`open ${url}`));

export function openBrowser(sales: Array<ISale>): void {
  if (sales.length === 0) {
    return;
  }

  console.log("opening browser");

  for (const sale of sales) {
    memoizedOpen(sale.url);
  }
}

function logCandidates(stream: fs.WriteStream, sales: Array<ISale>): void {
  if (sales.length === 0) {
    console.log("nothing");
    return;
  }
  const date = new Date().toISOString();
  console.log("writing to log");

  for (const sale of sales) {
    const url = sale.url;
    const collection = (sale as any).collection_name;
    const _yield = sale.staking_price_ratio.toFixed(2);
    const name = sale.assets?.[0].name;
    const reward = sale.staking_reward.toFixed(2);
    stream.write(`${date} ${_yield} ${url} ${collection} ${name} ${reward} \n`);
  }
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

  while (true) {
    console.log("start");
    console.log("fetching...");
    try {
      const candidates = await fetchCandidates(stakingSettings);
      wait = Math.max(wait / 2, MIN_WAIT_TIME);

      logCandidates(stream, candidates);
      notify(candidates);
      openBrowser(candidates);
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

export async function fetchCandidates(
  stakingSettings: ICollectionStakingSettingsDict
): Promise<Array<ISale>> {
  const pages = await Promise.all([
    fetchCandidatesPage({ pageNumber: 1, stakingSettings, saleParams }),
    fetchCandidatesPage({ pageNumber: 2, stakingSettings, saleParams }),
  ]);

  return flatten(pages);
}
