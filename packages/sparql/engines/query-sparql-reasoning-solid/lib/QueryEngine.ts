
import { QueryEngine as QueryEngineBase } from '@comunica/query-sparql-reasoning';
import type { ActorInitQueryBase } from '@comunica/actor-init-query';
import { KeysRdfDereferenceConstantHylar, KeysRdfReason } from '@comunica/reasoning-context-entries';
import { ActorHttpInruptSolidClientAuthn } from '@comunica/actor-http-inrupt-solid-client-authn';
import { QueryFormatType, QueryStringContext, QueryAlgebraContext, QueryType, IQueryExplained } from '@comunica/types';

const engineDefault = require('../engine-default.js');
// TODO: Clean up when https://github.com/comunica/comunica/issues/949 is released
engineDefault.contextKeyShortcuts.rules = KeysRdfReason.rules.name;
engineDefault.contextKeyShortcuts.implicitDatasetFactory = KeysRdfReason.implicitDatasetFactory.name;
engineDefault.contextKeyShortcuts.session = ActorHttpInruptSolidClientAuthn.CONTEXT_KEY_SESSION;

/**
 * A Comunica SPARQL query engine.
 */
export class QueryEngine extends QueryEngineBase {
  public constructor(engine: ActorInitQueryBase = engineDefault) {
    super(engine);
  }

  queryOrExplain<QueryFormatTypeInner extends QueryFormatType>(query: QueryFormatTypeInner, context?: (QueryFormatTypeInner extends string ? QueryStringContext : QueryAlgebraContext) | undefined): Promise<QueryType | IQueryExplained> {
    // TODO: Don't make this RDFS by default
    return super.queryOrExplain(query, { rules: KeysRdfDereferenceConstantHylar.rdfs, ...context } as any);
  }
}
