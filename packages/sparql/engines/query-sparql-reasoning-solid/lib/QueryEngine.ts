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
import { QueryEngine as QueryEngineBase } from "@comunica/query-sparql-reasoning";
import type { ActorInitQueryBase } from "@comunica/actor-init-query";
import {
  KeysRdfDereferenceConstantHylar,
  KeysRdfReason,
} from "@comunica/reasoning-context-entries";
import { ActorHttpInruptSolidClientAuthn } from "@comunica/actor-http-inrupt-solid-client-authn";
import type {
  QueryFormatType,
  QueryStringContext,
  QueryAlgebraContext,
  QueryType,
  IQueryExplained,
} from "@comunica/types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const engineDefault = require("../engine-default");

// TODO: Clean up when https://github.com/comunica/comunica/issues/949 is released
engineDefault.contextKeyShortcuts.rules = KeysRdfReason.rules.name;
engineDefault.contextKeyShortcuts.implicitDatasetFactory =
  KeysRdfReason.implicitDatasetFactory.name;
engineDefault.contextKeyShortcuts.session =
  ActorHttpInruptSolidClientAuthn.CONTEXT_KEY_SESSION;

/**
 * A Comunica SPARQL query engine.
 */
export class QueryEngine extends QueryEngineBase {
  public constructor(engine: ActorInitQueryBase = engineDefault) {
    super(engine);
  }

  queryOrExplain<QueryFormatTypeInner extends QueryFormatType>(
    query: QueryFormatTypeInner,
    context?:
      | (QueryFormatTypeInner extends string
          ? QueryStringContext
          : QueryAlgebraContext)
      | undefined
  ): Promise<QueryType | IQueryExplained> {
    // TODO: Don't make this RDFS by default
    return super.queryOrExplain(query, {
      rules: KeysRdfDereferenceConstantHylar.rdfs,
      ...context,
    } as any);
  }
}
