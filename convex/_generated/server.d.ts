export function mutation<A = any, R = any>(config: {
  args: any;
  handler: (ctx: QueryCtx, args: A) => Promise<R>;
}): any;

export function query<A = any, R = any>(config: {
  args: any;
  handler: (ctx: QueryCtx, args?: A) => Promise<R>;
}): any;

export function action(config: any): any;
export function internalMutation(config: any): any;
export function internalQuery(config: any): any;
export function internalAction(config: any): any;

export interface QueryBuilder {
  withIndex(name: string, fn: (q: any) => any): QueryBuilder;
  collect(): Promise<any[]>;
  eq(field: string, value: any): QueryBuilder;
}

export interface Database {
  query(table: string): QueryBuilder;
  get(id: any): Promise<any>;
  patch(id: any, update: any): Promise<void>;
  insert(table: string, doc: any): Promise<any>;
}

export interface QueryCtx {
  db: Database;
  auth: any;
}
