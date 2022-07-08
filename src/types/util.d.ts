type Constructor<T = unknown> = new (...args: any[]) => T;
type POJO = Record<PropertyKey, any>;