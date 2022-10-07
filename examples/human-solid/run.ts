import { interactiveLogin } from 'solid-node-interactive-auth';
import { AppRunner, resolveModulePath } from '@solid/community-server';
import path from 'path';
import { QueryEngine } from '@comunica/query-sparql-solid';
import { solidQuery, FetchPersonDocument } from './graphql';

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
  
  console.log('The WebId of the logged in user is', person.id);

  await app.stop();
}

main()
