import fs from "fs";
import { memoize } from "lodash";
import { ISale } from "./fetchCandidates";

export function log(sale: ISale, date: string, stream: fs.WriteStream): void {
  const url = sale.url;
  const collection = (sale as any).collection_name;
  const name = sale.assets?.[0].name;
  const reward = (sale?.pool_asset_reward || sale.staking_reward).toFixed(2);
  const _yield = sale.reward_ratio.toFixed(2);
  stream.write(`${date} ${_yield} ${reward} ${url} ${collection} ${name} \n`);
}

export const memoizedLog = memoize(log, (sale) => sale.sale_id);

export function logCandidates(
  stream: fs.WriteStream,
  sales: Array<ISale>
): void {
  if (sales.length === 0) {
    console.log("nothing");
    return;
  }
  const date = new Date().toISOString();
  console.log("writing to log");

  for (const sale of sales) {
    memoizedLog(sale, date, stream);
  }
}
