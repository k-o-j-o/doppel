import { MulticastHandler, $Handler } from "@/common/multicast-handler";
import { SubscriptionManager } from "@/common/subscription-manager";
import { Ref, $Value } from "@/ref";
import { Action } from "./action";

const $Refs = Symbol('refs');

@MulticastHandler.Observable
export class ReactiveProvider<T extends POJO = unknown> implements Ref<T> {
  [$Refs]: Record<PropertyKey, Ref>;
  [$Value]: T;
  [$Handler] = new MulticastHandler();

  consumers: Ref<T>[] = [];

  constructor(obj: T) {
    SubscriptionManager.init(this, () => this[$Handler].next(this[$Value]));
    Object.entries(obj)
      .forEach(([key, value]) => {
        if (Ref.isRef(value)) {
          initChildReference(this, key, value);
        }
      });
  }
}
export interface ReactiveProvider<T> extends Ref<T> { }

const proxyHandlerFactory = <T extends POJO>(provider: ReactiveProvider<T>): ProxyHandler<T> => ({
  get(state, key) {
    Action.read(provider, key);
    return state[key];
  },
  set(state, key, value) {
    Action.write(provider, key);
    const ref = provider[$Refs][key] || initChildReference(provider, key, Ref.from(value));
    ref[$Value] = value;
    for (let consumer of provider.consumers) {
      const
    }
    return true;
  }
});

function initChildReference(reactive: ReactiveProvider, key: PropertyKey, ref: Ref) {
  SubscriptionManager.for(reactive).subscribeTo(ref);
  return reactive[$Refs][key] = ref;
}