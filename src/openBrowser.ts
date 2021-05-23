import util from "util";
import { exec as execRaw } from "child_process";
import { memoize } from "lodash";
import { ISale } from "./calcCandidates";

const exec = util.promisify(execRaw);

const memoizedOpen = memoize((url: string) => exec(`open ${url}`));

export function openBrowser(sales: Array<ISale>): void {
  if (sales.length === 0) {
    return;
  }

  console.log("opening browser");

  // only open the first 5
  sales.slice(0, 5).forEach((sale) => {
    memoizedOpen(sale.url);
  });
}
