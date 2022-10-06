import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useContext, useEffect } from 'react'
import { EngineContext, QueryContext, SessionContext } from '../context'
import styles from '../styles/Home.module.css'
import Center from '../components/Center';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';
import { getStorageFromSession } from '@inrupt/sparql-solid-utils';
import { Session } from '@inrupt/solid-client-authn-browser'
import { IQueryContext, queryBindings, objectPattern, queryObjects, ISparqlEngine } from '@inrupt/sparql-utils'
import { DataFactory as DF } from 'n3';
import { session } from '../components/data'
// import {} from '@comunica/query-sparql-link-traversal-solid';

const Home: NextPage = () => {
  const queryContext = useContext(QueryContext);
  // const { context } = useContext(SessionContext);
  // const { engine } = useContext(EngineContext);

  // useEffect(() => {

  //   if (context.session.info.isLoggedIn) {
  //     createQueryContext(engine, context.session)
  //     .then(c => {
  //       console.log(c)
  //     })
      
      
      
      
  //     // getFiles({
  //     //   // [ActorHttpInruptSolidClientAuthn.CONTEXT_KEY_SESSION]
  //     //   sparqlEngine: engine,
  //     //   context: {
  //     //     [CONTEXT_KEY_SESSION]: context.session,
  //     //   }
  //     // }, context.session)

  //     // getStorageFromSession({
  //     //   sparqlEngine: engine
  //     // }, context.session).then(storage => {
  //     //   console.log(storage);



  //     // });
  //   }

  //   // if (context.session.info.webId) {
  //   //   engine.queryBindings('SELECT DISTINCT ?s ?p ?o WHERE { ?s ?p ?o }', {
  //   //     // sources: [ context.session.info.webId ?? 'https://www.rubensworks.net/' ]
  //   //     sources: [ context.session.info.webId ]
  //   //   })
  //   //   .then(r => r.toArray())
  //   //   // .then(r => r.map(x => x.get('s')?.value))
  //   //   .then(r => console.log(r.map(x => x.get('p'))));
  //   // }
  // }, [ context.session.info.isLoggedIn, context.session.info.webId ])

  useEffect(() => {
    console.log('the query context is', queryContext)
  }, [queryContext])
  
  return (
    <div className="bg-black h-screen overflow-hidden">
    <Head>
      <title>Solid Music</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main className="flex">
      {/* <Sidebar /> */}
      <Center />
    </main>

    <div className="sticky bottom-0">
      {/* <Player /> */}
    </div>
  </div>
  )
}

export default Home
