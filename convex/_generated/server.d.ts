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

export interface QueryCtx {
  db: {
    query(table: string): any;
    get(id: any): Promise<any>;
    patch(id: any, update: any): Promise<void>;
    insert(table: string, doc: any): Promise<any>;
  };
  auth: any;
}
