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
      --template, -tpl find a specific NFT template by template_id
      --collection, -c specify a collection to find on
      --yield, y yield threshold to filter sales

`,
  {
    flags: {
      open: {
        type: "boolean",
        alias: "o",
        default: true,
      },
      notify: {
        type: "boolean",
        alias: "n",
        default: true,
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
    },
  }
);

export type IFlags = typeof cli.flags;

rpfinder(cli.flags).then(console.log, console.error);
