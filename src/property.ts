import { Subject } from "rxjs";

export const PROPERTY_FOR = Symbol('property');
export const DELETE_SIGNAL = Symbol('delete');

export class Property<T = any> {
  #subject: Subject<T>;
  readonly $state: Property<T> = this;

  protected constructor(
    public state: T
  ) {
    Object.defineProperties(this, {
      state: { value: state },
      $state: { value: this, writable: false }
    });
  }

  public get $isReactive() {
    return !!this.#subject;
  }

  public $set(value: T) {
    this.state = value;
  }

  get $changes() {
    this.#subject = new Subject();
    const observable = this.#subject.asObservable();

    Object.defineProperties(this, {
      $changes: { value: observable, writable: false },
      $set: { value: Property.#reactiveSet.bind(this), writable: false },
    });

    return observable;
  }

  static for<T>(value: T) {
    if (typeof value === 'object') {
      return value[PROPERTY_FOR] || (value[PROPERTY_FOR] = new Property(value));
    } else {
      return new Property(value);
    }
  }

  static #reactiveSet(this: Property, value: any) {
    if (value === DELETE_SIGNAL) {
      this.#subject.complete();
    } else {
      this.state = value;
      this.#subject.next(value);
    }
  }
}
