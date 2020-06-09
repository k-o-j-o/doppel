import { Subject, Observable } from 'rxjs';
import {
    ReferenceMap,
    _Binding,
    _formatBinding,
    _proxyFactory,
    _defineChildReference,
    _descriptorFactory
} from './util'

export abstract class Reference<V> {
    #activateListeners: ((value: V) => void)[] = [];
    #changesInitListeners: (() => void)[] = [];

    constructor(
        public $value: V
    ) { }

    abstract readonly $reactiveValue: V;

    abstract $bind(context: object, key: _Binding | string): Reference<V> & ReferenceMap<V>;

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

class _ObjectReference<V extends object> extends Reference<V> {
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

        return this as Reference<V>;
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

class _PrimitiveReference<V> extends Reference<V> {
    #subject: Subject<V>;
    #descriptor: PropertyDescriptor;

    get $reactiveValue() {
        return this.$value;
    }

    $bind(context: object, key: string) {
        Object.defineProperty(context, key, this.#descriptor || (this.#descriptor = _descriptorFactory.bind(this)()));
        return this as Reference<V>;
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

export function reference<V>(value: V): Reference<V> & ReferenceMap<V> {
    return (typeof value === 'object'
        ? new _ObjectReference(value as any)
        : new _PrimitiveReference(value)
    ) as any as Reference<V> & ReferenceMap<V>
}