import { Subject, Observable } from 'rxjs';
import {
    ReferenceMap,
    _Binding,
    _formatBinding,
    _proxyFactory,
    _defineChildReference,
    _descriptorFactory
} from './util'

export abstract class LazyReference<V> {
    #activateListeners: ((value: V) => void)[] = [];
    #changesInitListeners: (() => void)[] = [];

    constructor(
        public $value: V
    ) { }

    abstract readonly $reactiveValue: V;

    abstract $bind(context: object, key: _Binding | string): LazyReference<V> & ReferenceMap<V>;

    abstract _initChanges(): Observable<V>;
    abstract _triggerChanges(value: V): void;

    get changes$() {
        const changes$ = this._initChanges();
        Object.defineProperty(this, 'changes$', {
            value: changes$,
            writable: false,
            enumerable: false
        });

        this.#changesInitListeners
            .forEach((callback) => callback());
        this.#changesInitListeners = null;

        return changes$;
    }

    get $isActive() {
        return !this.#activateListeners; // #activateListeners is set to null and cannot be used once a ref has been activated
    }

    _activate() {
        if (!!this.#activateListeners) {
            this.#activateListeners
                .forEach((callback) => callback(this.$reactiveValue));
            this.#activateListeners = null;
        }
    }

    _onInitChanges(callback: () => void) {
        if (!!this.#changesInitListeners) {
            this.#changesInitListeners.push(callback);
        } else {
            callback();
        }
    }

    _onActivate(callback: (value: V) => void) {
        if (!!this.#activateListeners) {
            this.#activateListeners.push(callback);
        } else {
            callback(this.$reactiveValue);
        }
    }
}

class LazyObjectReference<V extends object> extends LazyReference<V> {
    #subject: Subject<V>;
    #proxy: V;

    constructor($value: V) {
        super($value);
        Object.entries($value)
            .forEach(_defineChildReference.bind(this));
    }

    get $reactiveValue() {
        return this.#proxy || (this.#proxy = _proxyFactory.bind(this)());
    }

    $bind(context: object, binding: _Binding | string) {
        const {
            value: valueKey,
            refs: refsKey
        } = _formatBinding(binding);

        Object.defineProperties(context, {
            [valueKey]: {
                value: this.$reactiveValue,
                writable: false,
                enumerable: true
            },
            [refsKey]: {
                value: this,
                writable: false,
                enumerable: true
            }
        });

        return this as LazyReference<V>;
    }

    _initChanges() {
        this.#subject = new Subject();
        return this.#subject.asObservable();
    }

    _triggerChanges(value) {
        this.$value = value;
        this.#subject.next(this.$value);
    }
}

class LazyPrimitiveReference<V> extends LazyReference<V> {
    #subject: Subject<V>;
    #descriptor: PropertyDescriptor;

    get $reactiveValue() {
        return this.$value;
    }

    set $reactiveValue(value) {
        this._triggerChanges(value);
    }

    $bind(context: object, key: string) {
        Object.defineProperty(context, key, this.#descriptor || (this.#descriptor = _descriptorFactory.bind(this)()));
        return this as LazyReference<V>;
    }

    _initChanges() {
        this.#subject = new Subject();
        return this.#subject.asObservable();
    }

    _triggerChanges(value) {
        this.$value = value;
        this.#subject.next(this.$value);
    }
}

export function reference<V>(value: V): LazyReference<V> & ReferenceMap<V> {
    return (typeof value === 'object'
        ? new LazyObjectReference(value as any)
        : new LazyPrimitiveReference(value)
    ) as any as LazyReference<V> & ReferenceMap<V>
}