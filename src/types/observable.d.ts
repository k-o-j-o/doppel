interface ObservableLike<T = unknown> {
  [Symbol.observable]: () => ObservableLike<T>;
  subscribe(observer: Observer<T>): Subscription;
  subscribe(
    next: (value: T) => void,
    error?: (err: any) => void,
    complete?: () => void
  ): Subscription;
}

interface Observer<T = unknown> {
  start?(susbscription: Subscription): any;
  next?(value: T): void;
  error?(err: any): void;
  complete?(): void;
}

interface Subscription {
  closed: boolean;
  unsubscribe(): void;
}

interface SubscriptionObserver<T> {
  closed: boolean;
  next(value: T): void;
  error(err: any): void;
  complete(): void;
}
