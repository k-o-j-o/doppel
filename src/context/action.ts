import { Reference, $Value } from '@/reference';
import { currentContext } from '@/context/stack';

export class Action<T extends ActionType = any, V = unknown> {
  private constructor(
    public readonly type: T,
    public readonly source: Reference | null,
    public readonly target: Reference<V>,
    public readonly value: V
  ) { }

  public static read<T>(source: Reference | null, target: Reference<T>) {
    const action = new Action('read', source, target, target[$Value]);
    currentContext()?.push(action);
    return action;
  }

  public static write<T>(source: Reference | null, target: Reference<T>, value: T) {
    const action = new Action('write', source, target, value);
    currentContext()?.push(action);
    return action;
  }
}

type ActionType = 'read' | 'write';