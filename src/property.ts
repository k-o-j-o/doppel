import { Subject } from "rxjs";

export class Property<T> {
  #subject: Subject<T>;

  protected constructor(
    public value: T
  ) { }

  public set(value: T) {
    this.value = value;
    this.#subject?.next(value);
  }

  get changes$() {
    this.#subject = new Subject();
    const observable = this.#subject.asObservable();

    Object.defineProperty(this, 'changes$', {
      value: observable
    });

    return observable;
  }

  static for<T>(value: T) {
    return new Property(value);
  }
}