import { interactiveLogin } from 'solid-node-interactive-auth';
import { AppRunner, resolveModulePath } from '@solid/community-server';
import path from 'path';
import { QueryEngine } from '@comunica/query-sparql-solid';
import { solidQuery, FetchPersonDocument } from './graphql';
import terminalImage from 'terminal-image';
import got from 'got';

export function createApp() {
  return new AppRunner().create(
    {
      mainModulePath: resolveModulePath(''),
      typeChecking: false,
    },
    resolveModulePath('config/default.json'),
    {},
    {
      port: 3_001,
      loggingLevel: 'off',
      seededPodConfigJson: path.join(__dirname, 'configs', 'solid-css-seed.json'),
    },
  );
}

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

  const { person } = data;

  const {
    img,
    birthDate,
    mother,
    father,
    name,
    ancestors,
    id
  } = data.person

  console.log('This is', name, 'their WebId is', id);

  if (img) {
    console.log(
      await terminalImage.buffer(await got(img).buffer())
    )
  }

  console.log('Their date of birth is', birthDate.toDateString());
  console.log('Their biological mother', mother.name, 'was born on', mother.birthDate.toDateString());
  console.log('Their biological father', father.name, 'was born on', father.birthDate.toDateString());

  if (ancestors.length > 0) {
    console.log('The names of their ancestors include', ancestors.map(({ name }) => `"${name}"`).join(', '))
  }

  await session.logout();
  await app.stop();
}

main()
