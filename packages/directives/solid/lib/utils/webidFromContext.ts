import { ActorHttpInruptSolidClientAuthn } from '@comunica/actor-http-inrupt-solid-client-authn';
import { QueryContext } from '@rdfjs/types';
import { DataFactory as DF } from 'n3';
import type { Session } from '@inrupt/solid-client-authn-browser';

// TODO: Fix this
export function getSessionFromContext(context: QueryContext): Session {
  const session = 
    context[ActorHttpInruptSolidClientAuthn.CONTEXT_KEY_SESSION.name] ??
    context.session ??
    // TODO: Fix these bottom 2 [they should not be necessary]
    context.context?.[ActorHttpInruptSolidClientAuthn.CONTEXT_KEY_SESSION.name] ??
    context.context?.session;

  if (session === undefined) {
    throw new Error('Expected session, received undefined')
  }

  return session;
}

export function getWebIdFromContext(context: QueryContext) {
  const { info } = getSessionFromContext(context);

  if (info.isLoggedIn !== true) {
    throw new Error(`Cannot retrieved webId from a Session that is not logged in`)
  }

  const webId = info.webId;

  if (typeof webId !== 'string') {
    throw new Error(`Expected webId to be a string, instead received ${typeof webId}`)
  }

  return DF.namedNode(webId);
}
