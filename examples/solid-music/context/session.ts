import { Session } from "@inrupt/solid-client-authn-browser";
import { createContext } from "react";

interface SessionContext {
  session: Session;
  requestInProgress: boolean;
}

export const SessionContext = createContext({
  context: {
    session: new Session(),
    requestInProgress: false,
  },
  setContext(context: SessionContext): void {
    throw new Error("Unexpected Set Context Call");
  },
});
