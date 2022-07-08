import { MulticastHandler, $Handler } from "@/common/multicast-handler";
import { Action } from "@/common/action"
import { pushContext, popContext } from '@/common/context';
import { isObservable } from "@/common/util";

export const $Value = Symbol('value');

@MulticastHandler.Observable
export class Ref<T = unknown> {
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

  public static from<T>(ref: Ref<T>): Ref<T>
  public static from<T>(observable: ObservableLike<T>): Readonly<Ref<T>>
  public static from<T>(value: T): Ref<T>
  public static from(value) {
    if (!isObservable(value)) {
      return new Ref(value);
    } else {
      const observable = value[Symbol.observable]();

      if (Ref.isRef(observable)) return observable;
      // else return new AdaptedReference(observable)
    }
  }

  public static get for(): typeof _for {
    pushContext([]);
    return _for;
  }

  public static isRef(value): value is Ref {
    return $Value in value;
  }
}

function _for<T>(value: T): Ref<T>;
function _for<T extends Array<unknown>>(...values: T): { [key in keyof T]: Ref<T[key]> };
function _for(...values) {
  const context = popContext();
  if (values.length > 1) {
    const refs: Array<Ref> = [];
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
export interface Ref<T> extends ObservableLike<T> { }
