import { parseArgs } from "node:util";
import downloader from "./index.js";

const { values } = parseArgs({
  options: {
    url: {
      type: "string",
      short: "u",
    },
    output: {
      type: "string",
      default: "out",
      short: "o",
    },
    verbose: {
      type: "boolean",
      default: false,
      short: "v",
    },
    help: {
      type: "boolean",
      default: false,
      short: "h",
    },
  },
});

if (values.help) {
  console.log(`
Example usage:
================================
podcastdl --url https://foo.bar
=> basic usage, download the podcast feed to the default folder "out"

podcastdl --url https://foo.bar --output a-folder --verbose
=> download the podcast feed to the folder "a-folder" and show more logs

Options:
url: the url of the podcast feed
--url or -u

output: the folder to save the podcast files
--output or -o

verbose: show more logs
--verbose or -v

help: show this help
--help or -h
`);
  process.exit(0);
}

downloader(values.url, values.output, values.verbose);
