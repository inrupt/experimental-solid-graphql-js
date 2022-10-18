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
import { QueryEngine } from "@comunica/query-sparql-link-traversal";

const engine = new QueryEngine();

async function test() {
  const result = await engine.queryBindings(
    "SELECT DISTINCT * WHERE { <http://xmlns.com/foaf/0.1/Person> <http://www.w3.org/2000/01/rdf-schema#subClassOf>* ?o }",
    {
      recoverBrokenLinks: true, // This is not working yet
      sources: [
        "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf",
      ],
      lenient: true,
    }
  );
  // console.log(await result.map((r) => r.get("o")).toArray());
}

test().catch((e) => {
  // console.error(e);
});
