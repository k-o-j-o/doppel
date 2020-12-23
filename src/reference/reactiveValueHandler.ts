import { Reference } from "./Reference";
import { Observable, Subject } from "rxjs";

export const REFERENCE: unique symbol = Symbol('reference');

export function isReactive(value: any) {
    return !!value[REFERENCE];
}

export abstract class ReactiveValueHandler<M> {
    constructor(
        protected ref: Reference<M>
    ) { }

    private subject: Subject<M> = new Subject();
    changes$: Observable<M> = this.subject.asObservable();

    abstract get(): M;
    abstract set(value: M): boolean;

    static create<M>(ref: Reference<M>): ReactiveValueHandler<M> {
        if (typeof ref.$value !== 'object') return new PrimitiveValueHandler(ref);
        else if (Array.isArray(ref.$value)) return new ArrayValueHandler(ref as Reference<any>);
        else return new ObjectValueHandler(ref as Reference<any>);
    }
}

class ObjectValueHandler<M extends object> extends ReactiveValueHandler<M> {
    #proxy: M;
    #handler: ProxyHandler<M> = {
        get: (_, key) => {
            if (key === REFERENCE) return this.ref;
            else return this.ref[key].$reactiveValue;
        },
        set: (_, key, value) => {
            this.ref[key].$reactiveValue = value;
            return true;
        }
    }

    constructor(ref: Reference<M>) {
        super(ref);
        Object.entries(ref.$value)
            .forEach(this.defineChildReference);
    }

    get() {
        return this.#proxy ?? (this.#proxy = new Proxy(this.ref.$value, this.#handler))
    }

    set(newValue) {
        //TODO
        return true;
    }
    
    private defineChildReference([ key, value ]: [string, object]) {
        Object.defineProperty(this.ref, key, {
            value: Reference.create(value),
            writable: true,
            enumerable: true
        });
    }
}

class ArrayValueHandler<M extends Array<any>> extends ReactiveValueHandler<M> {
    
}

class PrimitiveValueHandler<M> extends ReactiveValueHandler<M> {
    
}