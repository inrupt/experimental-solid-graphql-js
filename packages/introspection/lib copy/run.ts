//
// Copyright 2022 Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import { QueryEngine } from "@comunica/query-sparql";

import { printSchemaWithDirectives } from "@graphql-tools/utils";
import * as fs from "fs";
import * as path from "path";
import { makeSchema } from "./create";

makeSchema(
  new QueryEngine(),
  "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf"
)
  .then((s) => {
    console.log('completed makeSchema')
    console.log(printSchemaWithDirectives(s));

    fs.writeFileSync(
      path.join(__dirname, "sample.graphql"),
      printSchemaWithDirectives(s)
    );
  })
  .catch(err => {
    console.error(err);
  });

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
