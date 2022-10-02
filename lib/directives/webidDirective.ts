import { Session } from '@inrupt/solid-client-authn-browser';
import { ISessionInfo } from '@inrupt/solid-client-authn-core';
import { DataFactory as DF } from 'n3';
import * as RDF from "@rdfjs/types";

// TODO: Enable customisation of behavior when not logged in
function getWebIDNode({ isLoggedIn, webId }: ISessionInfo): RDF.NamedNode {
  if (!isLoggedIn) {
    throw new Error("User is not logged in")
  }

  if (!webId) {
    throw new Error("WebID is not available");
  }

  return DF.namedNode(webId);
}


