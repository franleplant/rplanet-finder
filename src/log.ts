import fs from "fs";
import { ISale } from "./fetchCandidates";

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
    const url = sale.url;
    const collection = (sale as any).collection_name;
    const _yield = sale.staking_price_ratio.toFixed(2);
    const name = sale.assets?.[0].name;
    const reward = sale.staking_reward.toFixed(2);
    stream.write(`${date} ${_yield} ${url} ${collection} ${name} ${reward} \n`);
  }
}
