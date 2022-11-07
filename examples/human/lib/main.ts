import { solidQuery, FetchPersonDocument } from "../graphql";
// import { QueryEngine } from '@comunica/query-sparql-file';
import { QueryEngine } from "@comunica/query-sparql-file-reasoning";
import { KeysRdfDereferenceConstantHylar } from "@comunica/reasoning-context-entries";
import path from "path";
import terminalImage from "terminal-image";

export async function main() {
  const { data, errors } = await solidQuery({
    document: FetchPersonDocument,
    variables: {
      id: "https://id.inrupt.com/jeswr",
    },
    context: {
      sparqlEngine: new QueryEngine(),
      context: {
        sources: [
          path.join(__dirname, "..", "data", "me.ttl"),
          path.join(__dirname, "..", "data", "ontology.ttl"),
        ],
        rules: KeysRdfDereferenceConstantHylar.owl2rl,
      },
    },
  });

  if (!data) {
    throw new Error(`${errors?.join(", ")}`);
  }

  const { img, birthDate, mother, father, name, ancestors } = data.person;

  console.log(`This is ${name}`);

  if (img) {
    console.log(
      await terminalImage.buffer(
        Buffer.from(await (await fetch(img)).arrayBuffer())
      )
    );
  }

  console.log(`Their date of birth is ${birthDate.toDateString()}`);
  console.log(
    `Their biological mother ${
      mother.name
    } was born on ${mother.birthDate.toDateString()}`
  );
  console.log(
    `Their biological father ${
      father.name
    } was born on ${father.birthDate.toDateString()}`
  );

  if (ancestors.length > 0) {
    console.log(
      `The names of their ancestors include ${ancestors
        .map(({ name }) => `"${name}"`)
        .join(", ")}`
    );
  }
}
