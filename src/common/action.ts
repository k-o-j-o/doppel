import { Reference, $Value } from '@/reference';
import { currentContext } from '@/common/context';
import { Reactive } from '@/reactive';

export class Action<T extends ActionType = any, V = unknown> {
  private constructor(
    public readonly type: T,
    public readonly ref: Reference<V>,
    public readonly value: V,
    public readonly parent?: Reactive,
  ) { }

  public static read<T>(ref: Reference<T>) {
    const action = new Action('read', ref, ref[$Value]);
    currentContext()?.push(action);
  }

  public static write = Action.#write;

  public static readChild<T>(parent: Reactive, ref: Reference<T>) {
    const action = new Action('read', ref, ref[$Value], parent);
    currentContext()?.push(action);
  }

  public static writeChild<T>(parent: Reactive, ref: Reference<T>, value: T) {
    const action = new Action('write', ref, value, parent);
    Action.write = Action.#resetWrite;
    currentContext()?.push(action);
  }

  static #write<T>(ref: Reference<T>, value: T) {
    const action = new Action('write', ref, value);
    currentContext()?.push(action);
  }

  static #resetWrite<T>(ref: Reference<T>, value: T) {
    Action.write = Action.#write;
  }
}

type ActionType = 'read' | 'write';