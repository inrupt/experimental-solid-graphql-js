import { type Reducer, useReducer, useEffect } from 'react';
import type { ExecutionResult, GraphQLError } from 'graphql';
import { IContext, ISolidQueryOptions, solidQuery } from '../graphql';
import { getSessionFromContext } from '@inrupt/graphql-directives-solid/dist/utils';

interface IQueryOptions<TData, TVariables> extends ISolidQueryOptions<TData, TVariables> {
  requireLogin: boolean;
}

interface QueryState<TData> {
  result?: ExecutionResult<TData>;
  error?: any;
  requesting: boolean;
  pending: boolean;
}

interface Action<T> {
  type: 'pending' | 'requesting' | 'result' | 'error' | 'notPending';
  result?: ExecutionResult<T>;
  error?: any;
}

function reducer<T>(state: QueryState<T>, action: Action<T>): QueryState<T> {
  switch (action.type) {
    case 'pending':
      return { ...state, pending: true };
    case 'notPending':
      return { ...state, pending: false };
    case 'requesting':
      return { ...state, requesting: true, pending: false };
    case 'result':
      // Don't use spreader as we want to clear the 'error' field if there is one
      return { pending: state.pending, result: action.result, requesting: false }
    case 'error': {
      // Since this is going to be a network error type thing just persist the existing
      // result if there is one
      if (action.result) {
        return { ...state, requesting: false }
      } else {
        return { ...state, error: action.error, requesting: false }
      }
    }
    throw new Error('Unexpected action')
  }
}

type SolidReducer<TData> = Reducer<QueryState<TData>, Action<TData>>;

function useSolidQuery<TData, TVariables extends Record<string, any>>(
  options: IQueryOptions<TData, TVariables>
) {
  const session = getSessionFromContext(options.context);

  const [ state, dispatch ] = useReducer<SolidReducer<TData>>(
    reducer,
    { requesting: false, pending: false },
  );

  function runQuery() {
    if (!state.requesting) {
      if (!options.requireLogin || session.info.isLoggedIn) {
        dispatch({ type: 'requesting' });

        solidQuery(options).then(result => {
          dispatch({ type: 'result', result });
        }).catch(error => {
          dispatch({ type: 'error', error })
        });

      } else {
        // We cannot query when not logged in and login is required
        dispatch({ type: 'notPending' });
      }
    }
  }

  useEffect(runQuery, [ session, session.info.isLoggedIn, session.info.webId, options.variables, options.context ])

  useEffect(() => {
    if (state.pending) {
      runQuery()
    }
  }, [ state.requesting ]);

  return { result: state.result, error: state.error };
}


export interface QueryProps<TData, TVariables extends Record<string, any>> extends IQueryOptions<TData, TVariables> {
  children: (data: TData) => JSX.Element;
  error: (error: ReadonlyArray<GraphQLError>) => JSX.Element;
  fallback: () => JSX.Element;
}


export function Query<TData, TVariables extends Record<string, any>>(props: QueryProps<TData, TVariables>) {
  const { result } = useSolidQuery(props);

  if (!result) {
    return props.fallback();
  }

  if (result.data) {
    return props.children(result.data);
  }

  if (result.errors) {
    return props.error(result.errors);
  }

  throw new Error('Result received with no data or errors');
}


