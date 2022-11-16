import { createRunner } from "./createRunner";

createRunner()
  .then((runner) => {
    runner.app.start();
  })
  .catch((err) => {
    console.error(err);
  });
