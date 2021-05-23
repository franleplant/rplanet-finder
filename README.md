# rpfinder

> rplanet high yield asset finder.

This cli finds the best assets (NFTs) being sold in atomic market,
where "best" is determined by **the assets that yield the most when staked**.

For NFTs that are part of the `rplanet` collection the yield is pretty static,
but the yield for any other asset is highly dynamic based off of the collection pool
size, shareholders, etc. Basically, as collection grows their yield will tend to be reduced.

## Usage

```bash
# install deps
yarn install

# run cli
yarn start --help
yarn start --collection=rplanet
```

## Dev notes

- atomic market swagger https://wax.api.atomicassets.io/atomicmarket/docs/swagger/#/sales/get_v1_sales
