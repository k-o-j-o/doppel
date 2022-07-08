import { MulticastHandler, $Handler } from "@/common/multicast-handler";
import { SubscriptionManager } from "@/common/subscription-manager";
import { isObservable } from "@/common/util";
import { Ref, $Value } from "@/ref";
import { Action } from "./action";
import { Reactive, $Refs } from "./reactive";

const $Consumers = Symbol('consumers');

@MulticastHandler.Observable
export class ProxyProvider<T extends object = object> implements Ref<T> {
  [$Consumers] = new Set<Reactive<T>>();
  [$Refs] = new Map<PropertyKey, Ref>();
  [$Handler] = new MulticastHandler();
  [$Value]: T;

  constructor(value: T) {
    SubscriptionManager.init(this, () => this[$Handler].next(this[$Value]));
    value[Symbol.observable] = this[Symbol.observable].bind(this);
    this[$Value] = new Proxy(value, proxyHandlerFactory(this));
  }
}
export interface ProxyProvider<T> extends Ref<T> { }

export function getProxyProvider<T extends object>(value: T): ProxyProvider<T> {
  //TODO: is it safe to assume that because a value is observable, the attached instance is a ProxyProvider?
  if (isObservable(value)) {
    return value[Symbol.observable]() as ProxyProvider<T>
  } else {
    return new ProxyProvider(value);
  }
}

export function consumeProvider<T extends object>(
  consumer: Reactive<T>,
  provider: ProxyProvider<T>
): T {
  provider[$Consumers].add(consumer);
  return provider[$Value]
}

export function stopConsumingProvider<T extends object>(
  consumer: Reactive<T>,
  provider: ProxyProvider<T>
): void {
  provider[$Consumers].delete(consumer);
}

const proxyHandlerFactory = (provider: ProxyProvider): ProxyHandler<any> => ({
  get(state, key) {
    Action.read(provider, key);
    const ref = provider[$Refs][key] || initChildReference(provider, key, Reactive.from(state[key]));
    return ref[$Value];
  },
  set(state, key, value) {
    Action.write(provider, key);
    const ref = provider[$Refs][key] || initChildReference(provider, key, Reactive.from(value));
    state[key] = value;
    ref.value = value;
    for (let consumer of provider[$Consumers]) {
      const consumerRef = consumer[$Refs].get(key);
      if (consumerRef) {
        consumerRef[$Value] = ref[$Value];
        consumerRef[$Handler].next(ref[$Value])
      }
    }
    return true;
  }
});

function initChildReference(provider: ProxyProvider, key: PropertyKey, ref: Ref) {
  SubscriptionManager.for(provider).subscribeTo(ref);
  return provider[$Refs][key] = ref;
}