import { MulticastHandler, $Handler } from '@/common/multicast-handler';
import { Reference, $Value } from '@/reference';
import { Effect, Schedule } from '@/effect';
import { noop } from '@/common/util';

export const $Effect = Symbol('effect');

@MulticastHandler.Observable
export class Derived<T = unknown> implements Reference<T> {
    [$Handler] = new MulticastHandler();
    [$Value]: T
    [$Effect]: Effect<T>

    constructor(options: { get: () => T, set: (val: T) => void }) {
        this[$Effect] = Effect.register(() => this[$Value] = options.get(), Schedule.Sync);
    }

    get value(): T {

        return this[$Value];
    }

    set value(value: T) {

    }

    public static from<T>(get: () => T): Readonly<Derived<T>>;
    public static from<T>(options: { get: () => T }): Readonly<Derived<T>>;
    public static from<T>(options: { get: () => T, set: (val: T) => void }): Derived<T>;
    public static from(options, set?) {
        if (typeof options === 'function') {
            options = { get: options, set: set || noop }
        }
        const ref = new Derived(options);
        return ref;
    }
}
export interface Derived<T> extends Reference<T> { }
