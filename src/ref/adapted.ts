import { Ref, $Value } from '@/ref/ref';

export class AdaptedReference<T = unknown> extends Ref<T> {
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