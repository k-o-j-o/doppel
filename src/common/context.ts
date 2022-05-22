import type { Action } from '@/common/action';
type Context = Array<Action>;

export const CONTEXT_STACK: Array<Context> = [];

export function pushContext(context: Context): Context {
  CONTEXT_STACK.push(context);
  return context;
}

export function popContext(): Context {
  return CONTEXT_STACK.pop();
}

export function currentContext(): Context | undefined {
  return CONTEXT_STACK[CONTEXT_STACK.length - 1];
}