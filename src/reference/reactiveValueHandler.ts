import { Reference } from "./reference";
import { Observable, Subject } from "rxjs";

const PROXY_HANDLER: Symbol = Symbol('proxyHandler');

abstract class ReactiveValueHandler<M> {
    constructor(
        protected ref: Reference<M>
    ) { }

    private subject: Subject<M> = new Subject();
    changes$: Observable<M> = this.subject.asObservable();

    abstract get(): M;
    abstract set(value: M): boolean;
}

class ObjectValueHandler<M extends object> extends ReactiveValueHandler<M> {
    #proxy: M;
    #handler: ProxyHandler<M> = {
        get: (_, key) => {
            if (key === PROXY_HANDLER) return this.#handler;
            else return this.ref[key].$reactiveValue;
        },
        set: (_, key, value) => {
            this.ref[key].$reactiveValue = value;
            return true
        }
    }

    get() {
        return this.#proxy ?? (this.#proxy = this.createProxy())
    }

    set(newValue) {

    }

    private createProxy(): {

    }
}

class ArrayValueHandler<M extends Array<any>> extends ReactiveValueHandler<M> {
    
}

class PrimitiveValueHandler<M> extends ReactiveValueHandler<M> {
    
}