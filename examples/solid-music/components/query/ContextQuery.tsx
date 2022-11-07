import { Context, useContext } from "react";
import { Query as PureQuery, QueryProps as PureQueryProps } from "./Query";
import { QueryContext } from "../../context/engine";
import { IQueryContext } from "@inrupt/sparql-utils";

export type QueryProps<TData, TVariables extends Record<string, any>> = Omit<
  PureQueryProps<TData, TVariables>,
  "context"
>;

/**
 * A Query Component that is aware of the engine and session context.
 */
// TODO: Export a contextQueryFactory from a solid-graphql-react package & hook into it w. codegen.
function contextQueryFactory(QueryContext: Context<IQueryContext | undefined>) {
  return function Query<TData, TVariables extends Record<string, any>>(
    props: QueryProps<TData, TVariables>
  ): JSX.Element {
    const context = useContext(QueryContext);

    // If there is no context yet then we cannot execute the query so we are stuck on the fallback
    if (!context) {
      return props.fallback();
    }

    return <PureQuery {...props} context={context} />;
  };
}

export const Query = contextQueryFactory(QueryContext);
