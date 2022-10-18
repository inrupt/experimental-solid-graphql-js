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
import { ActorHttpInruptSolidClientAuthn } from "@comunica/actor-http-inrupt-solid-client-authn";
import { QueryContext } from "@rdfjs/types";
import { DataFactory as DF } from "n3";
import type { Session } from "@inrupt/solid-client-authn-browser";

// TODO: Fix this
export function getSessionFromContext(context: QueryContext): Session {
  const session =
    context[ActorHttpInruptSolidClientAuthn.CONTEXT_KEY_SESSION.name] ??
    context.session ??
    // TODO: Fix these bottom 2 [they should not be necessary]
    context.context?.[
      ActorHttpInruptSolidClientAuthn.CONTEXT_KEY_SESSION.name
    ] ??
    context.context?.session;

  if (session === undefined) {
    throw new Error("Expected session, received undefined");
  }

  return session;
}

export function getWebIdFromContext(context: QueryContext) {
  const { info } = getSessionFromContext(context);

  if (info.isLoggedIn !== true) {
    throw new Error(
      `Cannot retrieved webId from a Session that is not logged in`
    );
  }

  const { webId } = info;

  if (typeof webId !== "string") {
    throw new Error(
      `Expected webId to be a string, instead received ${typeof webId}`
    );
  }

  return DF.namedNode(webId);
}
