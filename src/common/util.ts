import Symbol_observable from 'symbol-observable';

export function isObservable(value): value is ObservableLike {
  return Symbol.observable in value;
}

export function isObject<T>(value: T): value is object & T {
  return (value && typeof value === 'object')
}

export const noop = (() => { });
