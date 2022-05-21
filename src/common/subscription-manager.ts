export class SubscriptionManager {
  private static instances = new Map<any, SubscriptionManager>();

  private constructor(
    private callback: () => void,
    private subscriptions: Subscriptions = new WeakMap()
  ) { }

  public subscribeTo(observable: ObservableLike) {
    const unsubscribe = () => this.unsubscribeFrom(observable);

    this.subscriptions.set(
      observable,
      observable.subscribe({
        next: this.callback,
        error: unsubscribe,
        complete: unsubscribe
      })
    );
  }

  public unsubscribeFrom(observable: ObservableLike) {
    const subscription = this.subscriptions.get(observable);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(observable);
    }
  }

  public static init(target: any, callback: () => void) {
    const manager = new SubscriptionManager(callback);
    SubscriptionManager.instances.set(target, manager);
    return manager;
  }

  public static for(target: any) {
    return SubscriptionManager.instances.get(target);
  }
}

type Subscriptions = WeakMap<ObservableLike, Subscription>;