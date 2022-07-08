import { MulticastHandler, $Handler } from "@/common/multicast-handler";
import { Ref, AdaptedReference, $Value } from "@/ref";
import { Action } from "@/common/action";
import { isObject, isObservable } from "@/common/util";
import { SubscriptionManager } from "@/common/subscription-manager";

export const $References = Symbol('references');

@MulticastHandler.Observable
export class Reactive<T extends object = Record<PropertyKey, unknown>> implements Ref<T> {
  [$References]: Record<PropertyKey, Ref> = {};
  [$Handler] = new MulticastHandler();
  [$Value]: T;

  constructor(value: T) {
    this[$Value] = _getProxyFor(this, value);
    SubscriptionManager.init(this, () => this[$Handler].next(this[$Value]))
  }

  public get value(): T {
    Action.read(this);
    return this[$Value];
  }

  public set value(value: T | Mutation<T>) {
    Action.write(this, value);
    this[$Value] = _getProxyFor(this, value);
    this[$Handler].next(this[$Value]);
  }

  public static from<T extends object>(value: T): Reactive<UnwrapRefs<T>>;
  public static from<T>(observable: ObservableLike<T>): Readonly<Ref<T>>;
  public static from<T>(ref: Ref<T>): Ref<T>;
  public static from<T>(value: T): Ref<T>;
  public static from(value) {
    //TODO: refactor this to use Reference.from to avoid dependency on AdaptedReference
    if (!isObject(value)) {
      return new Ref(value);
    } else if (!isObservable(value)) {
      return new Reactive(value);
    } else {
      const observable = value[Symbol.observable]();
      if (observable.hasOwnProperty($Value)) return observable;
      else return new AdaptedReference(value);
    }
  }
}
export interface Reactive<T> extends Ref<T> { }

function _getProxyFor<T extends object>(reactive: Reactive<T>, value: T) {
  //TODO: this doesn't take into account if value already belongs to a reactive object
  return new Proxy(
    Object.defineProperty(
      value,
      Symbol.observable,
      { value: reactive[Symbol.observable].bind(reactive), configurable: true }
    ),
    PROXY_HANDLER
  );
}

const PROXY_HANDLER: ProxyHandler<any> = {
  get(state, key) {
    const reactive = state[Symbol.observable]() as Reactive;
    const reference = reactive[$References][key] || _initChildReference(reactive, key, state[key]);
    Action.readChild(reactive, reference);
    return reference[$Value];
  },
  set(state, key, value) {
    const reactive = state[Symbol.observable]() as Reactive;
    const reference = (reactive[$References][key] || _initChildReference(reactive, key, state[key]));
    Action.writeChild(reactive, reference, value);
    state[key] = value;
    reference.value = value;
    return true;
  },
  deleteProperty(state, key) {
    const reactive = state[Symbol.observable]() as Reactive;
    delete state[key];
    delete reactive[$References][key];
    Action.write(reactive, state);
    return true;
  }
};

function _initChildReference(reactive: Reactive, key: PropertyKey, value: any) {
  const child = Reactive.from(value);
  reactive[$References][key] = child;
  SubscriptionManager.for(reactive).subscribeTo(child);
  return child;
}

type UnwrappedRef<T> = T extends Ref<infer V> ? V : T;
type UnwrapRefs<T extends object> = {
  [prop in keyof T]: T[prop] extends object
  ? T[prop] extends Ref<infer T1> ? T1 : UnwrapRefs<T[prop]>
  : T[prop]
};

class Mutation<T = unknown> {
  public constructor(
    public oldValue: T,
    public newValue: T
  ) { }
}
