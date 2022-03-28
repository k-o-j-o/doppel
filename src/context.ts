import { Property } from './property';

//TODO: should it be possible for multiple contexts to exist?
export class Context {
  #updateTimeout?: ReturnType<typeof setTimeout>;

  actions: Array<Action>;
  effects: Array<Effect>;

  public static INSTANCE = new Context();

  queueUpdate() {
    return this.#updateTimeout
      || (this.#updateTimeout = setTimeout(this.#update))
  }

  #update() {
    //TODO: this is incredibly inefficient
    this.actions
      .filter(({ type }) => type === 'set')
      .forEach(({ property }) => {
        this.effects
          .filter(({ dependencies }) => dependencies.includes(property))
          .forEach((effect) => effect.trigger());
      });
    this.#updateTimeout = undefined;
  }
}

export class Action<T = any> {
  private constructor(
    public readonly type: 'get' | 'set' | 'delete',
    public readonly property: Property,
    public readonly value: T
  ) { }

  public static get<T>(property: Property, value: T) {
    return new Action('get', property, value) as Action<T> & { type: 'get' };
  }

  public static set<T>(property: Property, value: T) {
    return new Action('set', property, value) as Action<T> & { type: 'set' };
  }

  public static delete<T>(property: Property, value: T) {
    return new Action('delete', property, value) as Action<T> & { type: 'delete' };
  }
}

class Effect {
  private constructor(
    public readonly trigger: Function,
    public readonly dependencies: Array<Property> = []
  ) { }

  public static register(func: Function) {
    const effect = new Effect(func);
    setTimeout(() => {
      func();
      Context.INSTANCE.actions
        .filter(({ type }) => type === 'get')
        .forEach(({ property }) => effect.dependencies.push(property))
    });
  }
}
