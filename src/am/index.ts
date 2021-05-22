import fetch from "node-fetch";
import { range, flatten } from "lodash";
import {
  Sale,
  SaleSort,
  SortOrder,
  SaleState,
  SaleParams,
} from "atomicmarket/build/API/Explorer/Types";
import { ExplorerApi } from "atomicmarket";

// TODO extract from env, probably use dotenv or similar solutions
const URL = "https://wax.api.atomicassets.io";
const NAMESPACE = "atomicmarket";
const api = new ExplorerApi(URL, NAMESPACE, { fetch: fetch as any });

export { Sale, SaleParams, SaleState, SaleSort, SortOrder };

export const getSales: typeof api.getSales = (...args) => api.getSales(...args);

//export interface IControlOptions {
//maxPages: number;
//batchSize: number;
//onNewPage: (page: Array<Sale>) => void | Promise<void>;
//}

//export const DEFAULT_CONTROL_OPTIONS: IControlOptions = {
//maxPages: 1_000_000,
//batchSize: 5,
//onNewPage: () => {},
//};

/**
 * get multiple pages of sales in
 * parallel badges taking in account
 * the rate limiting of the underlying api
 */
//export async function getSalesBatched(
//// TODO make PR to update fukcing type declarations
//params: SaleParams & { after?: number },
//controlOptions?: Partial<IControlOptions>
//): Promise<void> {
//console.log(`getSalesBatched ${JSON.stringify(params)}`);

//const { batchSize, maxPages, onNewPage } = {
//...DEFAULT_CONTROL_OPTIONS,
//...controlOptions,
//};

//let page = 1;

//while (true) {
//let finalPage = false;
//console.log(`batch from ${page} to ${page + batchSize}`);

//const batchPages = await Promise.all(
//range(page, page + batchSize).map(async (page) => {
//const salesPage = await getPage(page, params);

//if (salesPage.length === 0) {
//console.log("final page found", page);
//finalPage = true;
//}

//await onNewPage(salesPage);

//return salesPage;
//})
//);

//// concat all the pages in the batch
//const newSales = ([] as Array<Sale>).concat(...batchPages);
//console.log(
//`batch from ${page} to ${page + batchSize} done, got ${newSales.length}`
//);

//page = page + batchSize;

//if (page >= maxPages) {
//console.log("SOFT MAX reached");
//break;
//}

//if (finalPage) {
//console.log("final page found, stopping...");
//break;
//}
//}
//}

///**
//* Get a single page of sales with params
//*/
//async function getPage(page: number, params: SaleParams): Promise<Array<Sale>> {
//console.log(`page ${page}: fetching`);
//const sales = await api.getSales(params, page, 1000);
//console.log(`page ${page}: got ${sales.length} sales`);
//return sales;
//}
