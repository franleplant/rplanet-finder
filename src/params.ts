export const params = {
  OPEN: process.env.OPEN !== "false",
  NOTIFY: process.env.NOTIFY !== "false",
  TEMPLATE: process.env.TEMPLATE || undefined,
  COLLECTION: process.env.COLLECTION || undefined,
  YIELD: Number(process.env.YIELD || 0.5),
};

console.log("PARAMS", params);

export type IParams = typeof params;
