// This is a script for uploading the seed data to a live instance

import { saveSolidDatasetAt, fromRdfJsDataset } from "@inrupt/experimental-solid-client";
import { Store, Parser } from "n3";
import fs from "fs";
import path from "path";
import { interactiveLogin } from "solid-node-interactive-auth";

function getDataset(webid: string) {
  const pth = path.join(__dirname, "data.template.ttl");
  const fileString = fs.readFileSync(pth).toString();
  const dataString = fileString.replace("{{webid}}", webid);

  const parser = new Parser();
  return new Store(parser.parse(dataString));
}

function solidDataset(webid: string) {
  return fromRdfJsDataset(getDataset(webid));
}

// musicDemo
// music@demo.org
// musicDemo
// musicDemo

async function main() {
  const session = await interactiveLogin({
    oidcIssuer: "https://solidweb.me/",
  });

  const file = session.info.webId?.replace(/card\#me$/, "") + "music/data.ttl";

  await saveSolidDatasetAt(file, solidDataset(session.info.webId!), {
    fetch: session.fetch,
  });

  process.exit();
}

main();
