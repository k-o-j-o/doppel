import { Observable } from "rxjs";
import { ValueHandler, REFERENCE } from "./ValueHandler";

export class Reactive<M> {
    #valueHandler: ValueHandler<M> = ValueHandler.create(this);

    protected constructor(value: M) {
        this.#valueHandler.initValue(value);
    }

    public get $value() {
        return this.#valueHandler.getValue();
    }

    public set $value(newValue) {
        this.#valueHandler.setValue(newValue);
    }

    public get changes$() {
        this.#valueHandler.activate();
        Object.defineProperties(this, {
            changes$: {
                value: this.#valueHandler.subject.asObservable(),
                enumerable: true
            }
        });
        return this.changes$;
    }

    public static make<M>(value: M): Reactive<M> {
        if (isReactive(value)) {
            return value[REFERENCE];
        } else {
            const ref = new Reactive(value);
        }
    }
}

export function isReactive(value) {
    return !!value[REFERENCE];
}