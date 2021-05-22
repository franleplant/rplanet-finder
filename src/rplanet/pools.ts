import fetch from "node-fetch";

export interface IResponse {
  next_key: string;
  more: boolean;
  rows: Array<IPool>;
}

export interface IPool {
  id: string;
  staked: number;
  pending_staked: number;
  stock: string;
  fraction: string;
  start_time: number;
  enabled: number;
  issue: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  modifiers: Array<unknown>;
  payout: {
    quantity: string;
    next_account_key: number;
    next_time: number;
    state: number;
    r1: number;
    r2: number;
  };
}

const params = {
  code: "s.rplanet",
  index_position: 1,
  json: true,
  key_type: "i64",
  limit: 1000,
  reverse: false,
  scope: "bitcoinelite",
  show_player: false,
  table: "pools",
};

const url = "https://api.wax.alohaeos.com/v1/chain/get_table_rows";

export async function getPools(): Promise<Array<IPool>> {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      //"Accept": "*/*",
      //"Content-Type": "text/plain;charset=UTF-8",
    },
  });

  const body: IResponse = await res.json();
  return body.rows;
}
