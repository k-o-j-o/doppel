import { Reference, $Value } from '@/reference/reference';

export class AdaptedReference<T = unknown> extends Reference<T> {
  constructor(observable: ObservableLike<T>) {
    super();
    observable.subscribe({
      next: (value) => super.value = value
    });
  }

  public get value() {
    return this[$Value];
  }
}