import { Ref, $Value } from '@/ref';
import { MulticastHandler, $Handler } from "@/common/multicast-handler";
import { getProxyProvider, consumeProvider, stopConsumingProvider } from './proxy-provider';
import { Action } from './action';
import { isObject, isObservable } from '@/common/util';

export const $Refs = Symbol('references');

@MulticastHandler.Observable
export class Reactive<T extends POJO = unknown> implements Ref<T> {
  [$Refs] = new Map<PropertyKey, Ref>();
  [$Handler] = new MulticastHandler<T>();
  [$Value]: T;

  constructor(value: T) {
    const provider = getProxyProvider(value);
    this[$Value] = consumeProvider(this, provider);
  }

  public get value() {
    Action.read(this);
    return this[$Value];
  }

  public set value(value: T) {
    Action.write(this);
    if (value !== this[$Value]) {
      const oldProvider = getProxyProvider(this[$Value]);
      stopConsumingProvider(this, oldProvider);

      const newProvider = getProxyProvider(value);
      this[$Value] = consumeProvider(this, newProvider);
    }
    this[$Handler].next(this[$Value]);
  }

  public static from<T extends object>(value: T): Reactive<UnwrapRefs<T>>;
  public static from<T>(observable: ObservableLike<T>): Readonly<Ref<T>>;
  public static from<T>(ref: Ref<T>): Ref<T>;
  public static from<T>(value: T): Ref<T>;
  public static from(value) {
    if (isObject(value)) {
      if (isObservable(value)) {
        const observable = value[Symbol.observable]();
        if (Ref.isRef(observable)) return observable;
        //TODO: adapt observable to Reactive
      } else {
        return new Reactive(value);
      }
    } else {
      return new Ref(value);
    }
  }
}
export interface Reactive<T> extends Ref<T> { }

type UnwrappedRef<T> = T extends Ref<infer V> ? V : T;
type UnwrapRefs<T extends object> = {
  [prop in keyof T]: T[prop] extends object
  ? T[prop] extends Ref<infer T1> ? T1 : UnwrapRefs<T[prop]>
  : T[prop]
};
