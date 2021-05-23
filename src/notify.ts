import notifier from "node-notifier";
import { memoize } from "lodash";
import { ISale } from "./fetchCandidates";

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

  // only notify the first 5
  sales.slice(0, 5).forEach((sale) => {
    memoizedNotifySale(sale);
  });
}
