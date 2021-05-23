#!/usr/bin/env node
import meow from "meow";
import rpfinder from "./index";

const cli = meow(
  `
    Usage
      $ rpfinder

    Options
      --open, -o automatically open browser window
      --notify, -n notify of new sales found
      --yield, -y yield threshold to filter sales
      --max-price, -Mp max price in wax
      --collection, -c specify a collection to find on
      --template, -tpl find a specific NFT template by template_id
      --asset, -a asset id (this will return a single candidate)

`,
  {
    flags: {
      open: {
        type: "boolean",
        alias: "o",
        default: false,
      },
      notify: {
        type: "boolean",
        alias: "n",
        default: false,
      },
      template: {
        type: "number",
        alias: "tpl",
      },
      collection: {
        type: "string",
        alias: "c",
      },
      yield: {
        type: "number",
        alias: "y",
        default: 0.5,
      },
      asset: {
        type: "number",
        alias: "a",
      },
      maxPrice: {
        type: "number",
        alias: "Mp",
      },
    },
  }
);

export type IFlags = typeof cli.flags;

rpfinder(cli.flags).then(console.log, console.error);
