import { AppRunner, resolveModulePath } from "@solid/community-server";
import path from "path";

export function createApp() {
  return new AppRunner().create(
    {
      mainModulePath: resolveModulePath(""),
      typeChecking: false,
    },
    resolveModulePath("config/default.json"),
    {},
    {
      port: 3_001,
      loggingLevel: "off",
      seededPodConfigJson: path.join(
        __dirname,
        "configs",
        "solid-css-seed.json"
      ),
    }
  );
}
