import { getDefaultSession, Session } from "@inrupt/solid-client-authn-browser";
import { createContext, Reducer, useEffect, useReducer, useState } from "react";
import { session } from "../components old/data";

interface SolidSessionProps {
  restorePreviousSession?: boolean;
  onError?: (error: Error) => void;
}

// export function useSolidSession(props: SolidSessionProps) {
//   const [ session ] = useState(getDefaultSession());
//   const [ requestInProgress, setRequestInProgress ] = useState(false);

//   useEffect(() => {
//     session
//       .handleIncomingRedirect({ restorePreviousSession: props.restorePreviousSession })
//       .catch(err => { props?.onError?.(err) })
//       .finally(() => { setRequestInProgress(false) })
//   }, []);

//   return {
//     session,
//     login(...options: Parameters<Session['login']>) {
//       if (!requestInProgress) {
//         setRequestInProgress(true);

//         session.login(...options)
//           .catch(err => { props?.onError?.(err) })
//           .finally(() => { setRequestInProgress(false) })
//       }
//     }
//   }
// }

export function useSolidSession(props: SolidSessionProps) {
  const [session] = useState(getDefaultSession());
  const [requestInProgress, setRequestInProgress] = useState(false);

  useEffect(() => {
    session
      .handleIncomingRedirect({
        restorePreviousSession: props.restorePreviousSession,
      })
      .catch((err) => {
        props?.onError?.(err);
      })
      .finally(() => {
        setRequestInProgress(false);
      });
  }, []);

  useEffect(() => {}, [session.info.isLoggedIn, session.info.webId]);

  return {
    session,
    login(...options: Parameters<Session["login"]>) {
      if (!requestInProgress) {
        setRequestInProgress(true);

        session
          .login(...options)
          .catch((err) => {
            props?.onError?.(err);
          })
          .finally(() => {
            setRequestInProgress(false);
          });
      }
    },
  };
}
