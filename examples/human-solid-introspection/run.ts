import { QueryEngine } from '@comunica/query-sparql-solid';
import { createApp } from './configs/createApp';
import got from 'got';
import { interactiveLogin } from 'solid-node-interactive-auth';
import terminalImage from 'terminal-image';
import { FetchPersonDocument, solidQuery } from './graphql';

async function main() {
  const app = await createApp();
  await app.start();

  const session = await interactiveLogin({
    oidcIssuer: 'http://localhost:3001/'
  });

  const { data, errors } = await solidQuery({
    document: FetchPersonDocument,
    variables: {},
    context: {
      sparqlEngine: new QueryEngine(),
      context: {
        session,
        sources: [ session.info.webId ]
      }
    }
  });

  if (!data) {
    throw new Error(`${errors?.join(', ')}`)
  }

  const {
    id,
    image,
    birthday,
    knows,
    firstName,
    lastName,
    gender
  } = data.person

  console.log('This is', firstName[0] ?? '', lastName[0] ?? '', 'their WebId is', id);

  if (image?.[0]?.id) {
    console.log(
      await terminalImage.buffer(await got(image?.[0]?.id).buffer())
    )
  }

  if (birthday?.[0]) {
    console.log('Their date of birth is', birthday?.[0]);
  }

  if (knows?.length && knows.length > 0) {
    console.log('The names of their acquaintances include', knows.map((aquaintence) => {
      let name = aquaintence.firstName?.[0];
      if (name && aquaintence.lastName?.[0]) {
        name += ' ' + aquaintence.lastName?.[0];
      }
      if (!name) {
        name = aquaintence.id;
      }
      return name;
    }).join(', '))
  }

  await session.logout();
  await app.stop();
}

main()
