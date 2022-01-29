//TODO: do I want it to be possible for multiple contexts to exist?
export class Context {
  #updateTimeout: ReturnType<typeof setTimeout> | null;

  actions: Array<Action<any>>;
  effects: Array<Effect>;

  public static INSTANCE = new Context();

  queueUpdate() {
    return this.#updateTimeout
      || (this.#updateTimeout = setTimeout(this.#update))
  }

  #update() {

  }
}

class Action<T = any> {
  private constructor(
    public type: 'get' | 'set' | 'delete',
    public key: string | symbol,
    public value: T
  ) { }

  public static get<T>(key: string | symbol, value: T): Action<T> & { type: 'get' } {
    return new Action('get', key, value) as Action<T> & { type: 'get' };
  }

  public static set<T>(key: string | symbol, value: T): Action<T> & { type: 'set' } {
    return new Action('set', key, value) as Action<T> & { type: 'set' };
  }

  public static delete<T>(key: string | symbol, value: T): Action<T> & { type: 'delete' } {
    return new Action('delete', key, value) as Action<T> & { type: 'delete' };
  }
}

class Effect {
  private constructor(
    public call: Function,
    public keys: Array<string | symbol> = []
  ) { }

  public static create(op: Function) {
    const effect = new Effect(op);
    setTimeout(() => {
      op();
      Context.INSTANCE.actions
        .filter(({ type }) => type === 'get')
        .forEach(({ key }) => effect.keys.push(key))
    });
  }
}
