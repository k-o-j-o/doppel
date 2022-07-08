import { currentContext } from "./context";
import { Ref } from "@/ref";

export class Action<T extends ActionType = any, V = unknown>  {
  private constructor(
    public readonly type: T,
    public readonly source: Ref<V>,
    public readonly key?: PropertyKey
  ) { }

  public static read(source: Ref, key?: PropertyKey) {
    const action = new Action('read', source, key);
    currentContext()?.push(action);
  }

  public static write(source, key?: PropertyKey) {
    const action = new Action('write', source, key);
    currentContext()?.push(action);
  }
}

type ActionType = 'read' | 'write';