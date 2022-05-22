import { MulticastHandler, $Handler } from "@/common/multicast-handler";
import { Action, pushContext, popContext } from '@/context';
import { isObservable } from "@/common/util";
// import { AdaptedReference } from "@/reference/adapted-reference";

export const $Value = Symbol('value');

@MulticastHandler.Observable
export class Reference<T = unknown> {
  [$Handler] = new MulticastHandler();
  [$Value]: T;

  constructor(value?: T) {
    this[$Value] = value;
  }

  public get value() {
    Action.read(this);
    return this[$Value];
  }

  public set value(value: T) {
    Action.write(this, value);
    this[$Value] = value;
    this[$Handler].next(value);
  }

  public static from<T>(ref: Reference<T>): Reference<T>
  public static from<T>(observable: ObservableLike<T>): Readonly<Reference<T>>
  public static from<T>(value: T): Reference<T>
  public static from(value) {
    if (!isObservable(value)) {
      return new Reference(value);
    } else {
      const observable = value[Symbol.observable]();

      if (observable.hasOwnProperty($Value)) return observable;
      // else return new AdaptedReference(observable)
    }
  }

  public static get for(): typeof _for {
    pushContext([]);
    return _for;
  }
}

function _for<T>(value: T): Reference<T>;
function _for<T extends Array<unknown>>(...values: T): { [key in keyof T]: Reference<T[key]> };
function _for(...values) {
  const context = popContext();
  if (values.length > 1) {
    const refs: Array<Reference> = [];
    for (let i = 0; i < context.length; i++) {
      if (context[i].ref !== context[i + 1]?.parent) {
        refs.push(context[i].ref);
      }
    }
    return refs;
  } else {
    return context[context.length - 1].ref;
  }
}
export interface Reference<T = unknown> extends ObservableLike<T> { }
