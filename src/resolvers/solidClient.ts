import { IContext, ISparqlEngine } from "./types";

// type Supplement<K, T> = Omit<K, keyof T> & Partial<K>
// type Supplement<K, T> = K extends infer J ? J : never;
// const x: Supplement<IContext, { sparqlEngine: ISparqlEngine }>

type MaybeSparqlEngine<T extends Partial<IContext>> = T['sparqlEngine'] extends ISparqlEngine ?
  { sparqlEngine?: ISparqlEngine } :
  { sparqlEngine: ISparqlEngine };

class SolidClient<T extends Partial<IContext>> {
  constructor(private readonly context: T) {

  }

  query(...[context]: {} extends MaybeSparqlEngine<T> & Partial<IContext> ? [context?: MaybeSparqlEngine<T> & Partial<IContext>]: [context: MaybeSparqlEngine<T> & Partial<IContext>]) {

  }
    
    
  // context: {} extends C ? C | undefined : C) {
  // let _context: IContext = { ...this.context, ...context }
  // }
  
  
  // query<Data = any, Variables extends AnyVariables = AnyVariables>(query: DocumentNode | TypedDocumentNode<Data, Variables> | string, variables: Variables, context?: Partial<IContext>): PromisifiedSource<OperationResult<Data, Variables>>;
}

const client = new SolidClient({
  // TODO: Handle undefined in this type
  sparqlEngine: undefined as any as ISparqlEngine,
  // context: {
    
  // }
});


client.query()


function test(x: { hell0?: boolean }) {
  x.hell0
}
