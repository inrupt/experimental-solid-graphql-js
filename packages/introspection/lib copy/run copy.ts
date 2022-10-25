// import { QueryEngine } from '@comunica/query-sparql';
import { getOwlClasses, getProperties, predictAllClasses } from './utils';
import { QueryEngine } from '@comunica/query-sparql-link-traversal';
import { DataFactory as DF } from 'n3';

async function main() {
  const engine = new QueryEngine();

  // const classes = await predictAllClasses({
  //   sparqlEngine: new QueryEngine(),
  //   context: {
  //     sources: [
  //       "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf"
  //     ],
  //     lenient: true
  //   }
  // }, DF.namedNode('http://xmlns.com/foaf/0.1/Group'));

  // console.log(classes)

  const WAYBACK_URL = 'http://wayback.archive-it.org/';

  function addWayback(action: any): any {
    const request = new Request(action.input, action.init);
    return {
      input: new Request(new URL(`/${request.url}`, WAYBACK_URL), request),
    };
  }

  const results = await engine.queryBindings(`
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  
  SELECT ?type WHERE {
    foaf:Group (rdfs:subClassOf*/^rdfs:domain/rdfs:range) ?type
  }`,
    {
      // @ts-ignore
      sources: [
        "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf"
        // "http://xmlns.com/foaf/spec/20140114.rdf"
      ],
      lenient: true,
      // httpProxyHandler: {
      //   async getProxy(request) {
      //     const res = await fetch(request.input, { method: 'HEAD' });

      //     if (res.status !== 200 || res.url === 'http://xmlns.com/foaf/0.1/') {

      //       let newRequest;
      //       if (res.url === 'http://xmlns.com/foaf/0.1/') {
      //         newRequest = {
      //           input: new Request("https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf")
      //         }; 
      //       } else {
      //         newRequest = addWayback(request);
      //       }

      //       const res2 = await fetch(newRequest.input, { method: 'HEAD' });
      //       console.log(res2.status, res2.url)
      //       if (res2.status === 200) {
      //         console.log('new request', newRequest.input.toString())
      //         return newRequest;
      //       }
      //     }
      //     console.log('res', request.input.toString(), res.url)
      //     return request;
      //   }
      // }
    }
  )
  const arr = await results.toArray();
  console.log(arr.map(r => r.get('type')))
}

main();
