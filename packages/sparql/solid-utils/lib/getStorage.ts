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
import {
  queryTerm,
  type IQueryContext,
  objectPattern,
} from "@inrupt/experimental-sparql-utils";
import { DataFactory as DF } from "n3";
import type { Term } from "@rdfjs/types";
import type { Session } from "@inrupt/solid-client-authn-browser";

export function getPimStorage(context: IQueryContext, webId: Term) {
  return queryTerm(
    context,
    objectPattern(
      webId,
      DF.namedNode("http://www.w3.org/ns/pim/space#storage")
    ),
    { optional: true }
  );
}

export async function getStorageFromContext(
  context: IQueryContext,
  webId: Term
): Promise<string> {
  // Use pim:storage if it is available
  const storage = await getPimStorage(context, webId);

  // If pim:storage is not available use WebID /profile/card#me stripped (hacky)
  if (storage === null) {
    return webId.value.replace(/profile\/card#me$/, "");
  }

  // Storage nodes should be a NamedNode
  if (storage.termType !== "NamedNode") {
    throw new Error(
      `Expected storage to be a NamedNode, received ${storage.termType}`
    );
  }

  return storage.value;
}

export function getWebIdFromSession(session: Session): string {
  const { webId } = session.info;

  if (webId === undefined) {
    throw new Error("Expected webId to be defined - but received undefined");
  }

  return webId;
}

export async function getStorageFromSession(
  context: IQueryContext,
  session: Session
) {
  const webId = getWebIdFromSession(session);

  return getStorageFromContext(
    {
      sparqlEngine: context.sparqlEngine,
      context: {
        ...context.context,
        session,
        sources: [webId],
      },
    },
    DF.namedNode(webId)
  );
}
