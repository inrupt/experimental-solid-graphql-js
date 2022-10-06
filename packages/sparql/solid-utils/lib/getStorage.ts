import { queryTerm, type IQueryContext, objectPattern } from '@inrupt/sparql-utils';
import { DataFactory as DF } from 'n3';
import { Term } from '@rdfjs/types';
import { Session } from '@inrupt/solid-client-authn-browser';

export function getPimStorage(context: IQueryContext, webId: Term) {
  return queryTerm(context, objectPattern(webId, DF.namedNode('http://www.w3.org/ns/pim/space#storage')), { optional: true });
}

export async function getStorageFromContext(context: IQueryContext, webId: Term): Promise<string> {
  // Use pim:storage if it is available
  let storage = await getPimStorage(context, webId);

  // If pim:storage is not available use WebID /profile/card#me stripped (hacky)
  if (storage === null) {
    return webId.value.replace(/profile\/card\#me$/, '');
  }

  // Storage nodes should be a NamedNode
  if (storage.termType !== 'NamedNode') {
    throw new Error(`Expected storage to be a NamedNode, received ${storage.termType}`)
  }

  return storage.value
}

export function getWebIdFromSession(session: Session): string {
  const webId = session.info.webId;

  if (webId === undefined) {
    throw new Error('Expected webId to be defined - but received undefined');
  }

  return webId;
}

export async function getStorageFromSession(context: IQueryContext, session: Session) {
  const webId = getWebIdFromSession(session);
  
  return getStorageFromContext({
    sparqlEngine: context.sparqlEngine,
    context: {
      ...context.context,
      session,
      sources: [ webId ],
    }
  }, DF.namedNode(webId));
}
