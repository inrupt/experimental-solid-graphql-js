import { QueryEngine } from "@comunica/query-sparql-solid";
import { interactiveLogin } from "solid-node-interactive-auth";
import terminalImage from "terminal-image";
import { createApp } from "./createApp";
import { FetchPersonDocument, solidQuery } from "./graphql";

async function main() {
  const app = await createApp();
  await app.start();

  const session = await interactiveLogin({
    oidcIssuer: "http://localhost:3001/",
  });

  const { data, errors } = await solidQuery({
    document: FetchPersonDocument,
    variables: {},
    context: {
      sparqlEngine: new QueryEngine(),
      context: {
        session,
        sources: [session.info.webId],
      },
    },
  });

  if (!data) {
    throw new Error(`${errors?.join(", ")}`);
  }

  const { img, birthDate, mother, father, name, ancestors, id } = data.person;

  console.log("This is", name, "their WebId is", id);

  if (img) {
    console.log(
      await terminalImage.buffer(
        Buffer.from(await (await fetch(img)).arrayBuffer())
      )
    );
  }

  console.log("Their date of birth is", birthDate.toDateString());
  console.log(
    "Their biological mother",
    mother.name,
    "was born on",
    mother.birthDate.toDateString()
  );
  console.log(
    "Their biological father",
    father.name,
    "was born on",
    father.birthDate.toDateString()
  );

  if (ancestors.length > 0) {
    console.log(
      "The names of their ancestors include",
      ancestors.map(({ name }) => `"${name}"`).join(", ")
    );
  }

  await session.logout();
  await app.stop();
}

main();
