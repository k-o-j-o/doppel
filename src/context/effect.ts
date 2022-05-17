import type { Reference } from "@/reference";
import { pushContext, popContext } from "@/context/stack";

export class Effect<T = unknown> {
  #subscriptions = new WeakMap<Reference, Subscription>();

  public isScheduled: boolean = false;
  public dependencies: Array<Reference>;
  public invoke: () => T;

  constructor(
    protected func: () => T,
    protected scheduler: (callback: () => T) => any = Schedule.Queue
  ) {
    Object.defineProperty(this, 'invoke', {
      value: func
    });
  }

  public register() {
    Object.defineProperty(this, 'invoke', {
      value: _invoker.bind(this)
    });
    if (!this.dependencies) {
      this.dependencies = [];
      this.invoke();
    }
  }

  public deregister() {
    Object.defineProperty(this, 'invoke', {
      value: this.func
    });
  }

  public get isRegistered() {
    return this.invoke !== this.func;
  }

  public schedule() {
    if (!this.isScheduled) {
      this.isScheduled = true;
      this.scheduler(() => {
        this.isScheduled = false;
        return this.invoke();
      });
    }
  }

  public addDependency(dep: Reference) {
    if (!this.dependencies.includes(dep)) {
      this.dependencies.push(dep);
      this.#subscriptions.set(dep, dep.subscribe({
        next: () => this.schedule(),
        complete: () => this.removeDependency(dep)
      }));
    }
  }

  public removeDependency(dep: Reference) {
    const index = this.dependencies.indexOf(dep);
    if (index > -1) {
      this.dependencies.splice(index, 1);
      this.#subscriptions.get(dep)?.unsubscribe();
    }
  }

  public static register<T>(func: () => T, scheduler?: (callback: () => T) => any): Effect<T> {
    const effect = new Effect(func, scheduler);
    effect.register();
    return effect;
  }
}

export const Schedule = {
  Sync: (callback) => void callback(),
  Queue: queueMicrotask
};

function _invoker(this: Effect) {
  pushContext([]);
  const result = this.func();
  for (let action of popContext()) {
    this.addDependency(action.target);
  }
  return result;
}