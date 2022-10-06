import { useContext, useEffect, useState } from "react";
import { EngineContext } from "../context";
import { solidQuery, FetchPersonDocument } from '../graphql';

export default function Login() {
  const { engine } = useContext(EngineContext);
  const [{ results }, setResults] = useState({ results: ([] as string[]) })

  useEffect(() => {

    engine.queryBindings('SELECT DISTINCT * WHERE { <https://www.rubensworks.net/#me> <http://xmlns.com/foaf/0.1/givenName> ?o }', {
      sources: ['https://www.rubensworks.net/']
    })
      .then(b => b.toArray())
      .then(r => r.map(x => x.get('o')?.value!))
      .then(r => { setResults({ results: r }) });

    solidQuery({
      document: FetchPersonDocument,
      variables: {
        _id: 'https://www.rubensworks.net/#me'
      },
      context: {
        sparqlEngine: engine,
        context: {
          sources: [ 'https://www.rubensworks.net/' ]
        }
      }
    }).then(r => {
      console.log(r)
    })
  }, []);


  return (
    <div>
      {results}
    </div>
  )
}