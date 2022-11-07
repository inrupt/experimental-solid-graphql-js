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
import type { GetMeshSourcePayload, MeshHandler } from "@graphql-mesh/types";
import { createGraphql } from "./createGraphql";
import { getOntologyData } from "./getOnotologyData";

interface OntologyHandlerOptions {
  config: {
    source: string | [string, ...string[]];
  };
}

// TODO: See if graphql should be peer dep
// TODO: Add parameters to enable customisations
// where we can do things like
// - treat an RDFS list as an actual list
//

export default class OntologyHandler implements MeshHandler {
  private sources: [string, ...string[]];

  constructor({ config: { source } }: OntologyHandlerOptions) {
    this.sources = typeof source === "string" ? [source] : source;
  }

  async getMeshSource(payload: GetMeshSourcePayload) {
    const data = await getOntologyData(this.sources);

    return {
      schema: createGraphql(data),
    };
  }
}
