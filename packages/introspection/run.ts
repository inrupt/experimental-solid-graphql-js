import { QueryEngine } from '@comunica/query-sparql';
import { DataFactory as DF } from 'n3';
import { createObjectFromType, makeSchema } from './create';

import { printSchemaWithDirectives } from '@graphql-tools/utils';
import { makeExecutableSchema, extractExtensionsFromSchema,  } from '@graphql-tools/schema'
import path from 'path'
import fs from 'fs';

makeSchema(new QueryEngine(), 'https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf')
  .then(s => {
    fs.writeFileSync(
      path.join(__dirname, 'sample.graphql'),
      printSchemaWithDirectives(s)
    )
  })

// const result = createObjectFromType({
//   sparqlEngine: new QueryEngine(),
//   context: {
//     sources: [ 
//       'https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf'
//     ]
//   }
// }, DF.namedNode("http://xmlns.com/foaf/0.1/Person"));

// result.then(r => {
//   // makeExecutableSchema({ typeDefs: {
    
//   // } })
//   // console.log(r.toString())
//   // console.log(printSchemaWithDirectives(r))
// })


