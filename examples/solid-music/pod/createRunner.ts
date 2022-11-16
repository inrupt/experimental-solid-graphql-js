import { AppRunner } from "@solid/community-server";
import * as path from "path";
import { getPort } from "get-port-please";

export async function createRunner() {
  const runner = new AppRunner();

  const port = await getPort();
  const app = await runner.createCli([
    process.argv[0],
    process.argv[1],
    "--seededPodConfigJson",
    path.join(__dirname, "seed.json"),
    "-p",
    `${port}`,
  ]);

  return { app, port };
}
