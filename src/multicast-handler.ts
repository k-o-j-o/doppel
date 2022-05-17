import { noop } from "./util";

export class MulticastHandler<T> {
  public observers: SubscriptionObserver<T>[] = [];

  next(value: T) {
    for (let observer of this.observers) {
      observer.next(value);
    }
  }

  static Observable<T extends MulticastConstructor>(ctor: T) {
    Object.defineProperties(ctor.prototype, {
      [Symbol.observable]: {
        value: function () {
          return this;
        }
      },
      subscribe: {
        value: MulticastHandler.subscriber
      }
    });
  }

  static subscriber(this: InstanceType<MulticastConstructor>, observerOrNext, error?, complete?): Subscription {
    if (typeof observerOrNext !== 'object' || observerOrNext === null) {
      observerOrNext = { next: observerOrNext, error, complete };
    }
    const subscriptionObserver = createSubscriptionObserver(observerOrNext);
    this[$Handler].observers.push(subscriptionObserver);
    return createSubscription(this[$Handler], subscriptionObserver);
  }
}

export const $Handler = Symbol('handler');

const createSubscriptionObserver = <T>(observer: Observer<T>): SubscriptionObserver<T> => ({
  closed: false,
  next: observer.next?.bind(observer) ?? noop,
  error: observer.error?.bind(observer) ?? noop,
  complete: observer.complete?.bind(observer) ?? noop
});

const createSubscription = (handler: MulticastHandler<any>, observer: SubscriptionObserver<any>): Subscription => ({
  closed: false,
  unsubscribe() {
    handler.observers.splice(
      handler.observers.indexOf(observer),
      1
    );

    this.closed = true;
    this.unsubscribe = noop;
  }
});

type MulticastConstructor = new (...args: any[]) => { [$Handler]: MulticastHandler<any> } & ObservableLike<any>;