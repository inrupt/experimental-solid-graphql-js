// import '../styles/globals.css'
// NOTE: This only works if tailwind is in the adjacent node_modules
import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import { getDefaultSession, Session } from '@inrupt/solid-client-authn-browser';
import { useEffect, useState } from 'react';
import { EngineContext, QueryContext, SessionContext } from '../context';
// import { QueryEngine } from '@inrupt/query-sparql-reasoning-solid';
// TODO: USe reasoning and link traversal
import { QueryEngine } from '@comunica/query-sparql-solid';
import { useRouter } from 'next/router';
import { session } from '../components/data';
import { IQueryContext, ISparqlEngine, queryBindings, queryObject, queryObjects, queryTerm } from '@inrupt/sparql-utils';
// import { get } from '@inrupt/sparql-solid-utils';
import { getStorageFromSession } from '@inrupt/sparql-solid-utils';
import { DataFactory as DF } from 'n3';
// import {} from '@inrupt/query-sparql-reasoning-solid'
// import { QueryEngine } from '@comunica/query-sparql-link-traversal-solid';
import { solidQuery, FetchAlbumDocument, ISolidQueryOptions, FetchAlbumsQuery, FetchAlbumsQueryVariables } from '../graphql';
import { ExecutionResult } from 'graphql';
import { getSessionFromContext } from '@inrupt/graphql-directives-solid/dist/utils';

// Start hacky section

const CONTEXT_KEY_SESSION = '@comunica/actor-http-inrupt-solid-client-authn:session';

function toMeta(container: string) {
  return new URL('.meta', container).href;
}

function getContained(context: IQueryContext, storage: string) {
  return queryObjects({
    ...context,
    context: {
      ...context.context,
      sources: [ toMeta(storage) ]
    }
  }, DF.namedNode(storage), DF.namedNode('http://www.w3.org/ns/ldp#contains'));
}

async function getContainedString(context: IQueryContext, storage: string) {
  const nodes = await getContained(context, storage);
  return nodes.map(node => {
    if (node.termType !== 'NamedNode') {
      throw new Error('Named Node expected')
    }
    return node.value;
  });
}

async function getAllContains(context: IQueryContext, storage: string): Promise<string[]> {
  const contained = await getContainedString(context, storage);
  const result = contained.map(async (contain) => {
    // TOOD: Do this using metadata instead
    if (contain.endsWith('/')) {
      return getAllContains(context, contain);
    } else {
      const type = await queryObject({
        ...context,
        context: {
          ...context.context,
          sources: [ contain + '.meta' ]
        }
      }, DF.namedNode(contain), DF.namedNode('http://www.w3.org/ns/ma-ont#format'));
      // console.log(type)
      if (type.value === 'text/turtle') {
        return [ contain ];
      } else {
        return [];
      }
    }
  });
  const resolved = await Promise.all(result);
  return ([] as string[]).concat(...resolved)
}


async function getFiles(context: IQueryContext, session: Session) {
  const storage = await getStorageFromSession(context, session);
  return getAllContains(context, storage);
}

async function createQueryContext(engine: ISparqlEngine, session: Session): Promise<IQueryContext> {
  const sources = await getFiles({
    sparqlEngine: engine,
    context: {
      [CONTEXT_KEY_SESSION]: session,
    }
  }, session);

  return {
    sparqlEngine: engine,
    context: {
      [CONTEXT_KEY_SESSION]: session,
      sources,
    }
  }
}
// End hacky section

// TODO: Propose a good way of handling this when login changes
// TODO: Handle caching better
function useSolidQuery<TData, TVariables extends Record<string, any>>(options: ISolidQueryOptions<TData, TVariables>): ExecutionResult<TData> | undefined {
  const [ result, setResult ] = useState<ExecutionResult<TData> | undefined>()
  
  useEffect(() => {
    solidQuery(options).then(res => {
      setResult(res);
    })
  }, [options.context.context?.session, options.variables]);

  return result;
}

function useAuthenticatedSolidQuery<TData, TVariables extends Record<string, any>>(options: ISolidQueryOptions<TData, TVariables>): ExecutionResult<TData> | undefined {
  const [ result, setResult ] = useState<ExecutionResult<TData> | undefined>();
  const session = getSessionFromContext(options.context);

  useEffect(() => {

    if (session.info.isLoggedIn) {
      solidQuery(options).then(res => {
        setResult(res);
      })
    }

  }, [ session, session.info.isLoggedIn, session.info.webId, options.variables ]);

  return result;
}

interface QueryProps<TData, TVariables extends Record<string, any>> extends ISolidQueryOptions<TData, TVariables> {
  children: (data: ExecutionResult<TData>['data']) => JSX.Element;
  error: (error: ExecutionResult<TData>['errors']) => JSX.Element;
  fallback: () => JSX.Element;
}

function Query<TData, TVariables extends Record<string, any>>(props: QueryProps<TData, TVariables>): JSX.Element {
  const result = useAuthenticatedSolidQuery(props);

  if (!result) {
    return props.fallback();
  }

  if (result.data) {
    return props.children(result.data);
  }

  if (result.errors) {
    return props.error(result.errors);
  }

  throw new Error('Result received with no data or errors');
}

interface AlbumProps<TData, TVariables extends Record<string, any>> {
  context: ISolidQueryOptions<TData, TVariables>['context'];
  variables: ISolidQueryOptions<TData, TVariables>['variables'];
}

function AlbumComponent(props: AlbumProps<FetchAlbumsQuery, FetchAlbumsQueryVariables>) {
  return <Query
    document={FetchAlbumDocument}
    // TODO: Setup a codegen version of this (generate the session + query context and export a query component)
    // with both of those
    context={props.context}
    variables={props.variables}
    fallback={() => <div>Loading ...</div>}
    error={() => <div>Error Loading data</div>}
    children={() => <div>Data loaded!</div>}
  />
}

function MyApp({ Component, pageProps }: AppProps) {
  const { query } = useRouter();
  const [context, setContext] = useState({
    session: new Session(),
    requestInProgress: false,
  });
  const [engine] = useState(new QueryEngine());
  const [queryContext, setQueryContext] = useState<undefined | IQueryContext>();


  useEffect(() => {
    if (context.session.info.isLoggedIn) {
      // (async () => {
      //   // const sources: [string, string] = [ context.session.info.webId!, await getStorageFromSession({ sparqlEngine: engine, context: { [CONTEXT_KEY_SESSION]: session, sources: [ context.session.info.webId! ] } }, context.session) ];
      //   // console.log(sources)

      //   const r = await engine.queryBindings(`SELECT * WHERE { <${context.session.info.webId}> ?p ?o }`, {
      //     sources: [context.session.info.webId!],
      //     [CONTEXT_KEY_SESSION]: session,
      //     session: session,
      //     lenient: true,
      //     recoverBrokenLinks: true,
      //     '@comunica/bus-http:recover-broken-links': true
      //   });

      //   r.on('data', data => {
      //     console.log('data', data.get('p'), data.get('o'))
      //   })
      //   r.on('end', data => {
      //     console.log('end')
      //   })
      //   r.on('error', err => {
      //     console.warn(err)
      //   })
      // })();

      // const r = engine.queryBindings(`SELECT * WHERE { <${context.session.info.webId}> <http://xmlns.com/foaf/0.1/likes> ?o }`, {
      //   sources: [ context.session.info.webId!, getStorageFromSession() ],
      //   [CONTEXT_KEY_SESSION]: session,
      //   lenient: true,
      //   recoverBrokenLinks: true,
      //   '@comunica/bus-http:recover-broken-links': true
      // }).then(d => {
      //   d.on('data', data => {
      //     console.log('data', data.get('o'))
      //   })
      //   d.on('end', data => {
      //     console.log('end')
      //   })
      //   d.on('error', err => {
      //     console.warn(err)
      //   })
      // })
      createQueryContext(engine, context.session)
      .then(c => {
        setQueryContext(c);
      });
      
    }
  }, [ context.session.info.isLoggedIn, context.session.info.webId ])

  useEffect(() => {
    if (queryContext) {
      const r = queryContext
        .sparqlEngine
        .queryBindings(`SELECT * WHERE { <${context.session.info.webId}> ?p ?o }` as any, queryContext.context)
        .then(d => {

          d.on('data', data => {
            console.log(data.get('p').value, data.get('o').value)
          })

          d.on('end', () => {
            console.log('end')
          })

        })

      // TODO: Get GraphQL working and enable this
      // solidQuery({
      //   document: FetchAlbumDocument,
      //   context: queryContext,
      //   variables: {
      //     id: 'http://example.org/record#Angels_Album'
      //   }
      // }).then(r => {
      //   console.log(r)
      // })
    }
  }, [queryContext]);

  // useEffect(() => {
  //   if (!context.session.info.isLoggedIn) {
  //     console.log('use effect', query.code, query.state)
  //     context.session.handleIncomingRedirect({ restorePreviousSession: true })
  //     .then(session => {
  //       console.log('session', session)
  //     }).catch(err => {
  //       console.log('err', err)
  //     }).finally(() => {
  //       setContext({ session: context.session, requestInProgress: false });
  //     })
  //   }
    


  //   // if (query.code) {
  //   //   context.session.onSessionRestore(() => {
  //   //     console.log('session retored')
  //   //   })

  //   //   context.session.handleIncomingRedirect({
  //   //     // Add this to the index page with restore previous session:true
  //   //     restorePreviousSession: true,
  //   //   }).then(s => {
  //   //     return;
  //   //     if (s?.isLoggedIn) {
  //   //       push({ pathname: window.location.origin })
  //   //     } else {
  //   //       replace({
  //   //         pathname,
  //   //         query: {
  //   //           error: `Could not login`
  //   //         }
  //   //       });
  //   //     }
  //   //   }).catch(reason => {
  //   //     replace({
  //   //       pathname,
  //   //       query: {
  //   //         err: `${reason}`
  //   //       }
  //   //     });
  //   //   }).finally(() => {
  //   //     setContext({ session: context.session, requestInProgress: false });
  //   //   });
  //   // } else if (s.isLoggedIn) {

  //   // }
  // }, [query.code, query.state])

  return (
    <SessionContext.Provider value={{ context, setContext }}>
      <EngineContext.Provider value={{ engine }}>
        <QueryContext.Provider value={queryContext}>
          <Component {...pageProps} />
        </QueryContext.Provider>
      </EngineContext.Provider>
    </SessionContext.Provider>
  )
}

export default MyApp
