import { Subject, Observable } from 'rxjs';
import { isReactive, ReactiveValueHandler, REFERENCE } from './ReactiveValueHandler';
import { ReferenceMap, _Binding, _formatBinding } from './util';

export class Reference<M> {
    #valueHandler: ReactiveValueHandler<M>;
    
    public readonly $value: M;
    public readonly $isReadonly: boolean;
    public readonly changes$: Observable<M>;

    private constructor(value: M) {
        Object.defineProperties(this, {
            $value: {
                value,
                enumerable: true
            },
            $isReadonly: {
                value: false,
                enumerable: true
            },
            changes$: {
                value: this.#valueHandler.changes$,
                enumerable: true
            }
        });
    }

    public get $reactiveValue() {
        return this.#valueHandler.get();
    }

    public set $reactiveValue(newValue) {
        this.#valueHandler.set(newValue);
    }

    public get $readonly(): Reference<M> {
        const readonly = { ...this };
        Object.defineProperties(readonly, {
            $reactiveValue: {
                value: this.$value,
                enumerable: true
            },
            $isReadonly: {
                value: true,
                enumerable: true
            },
            $readonly: {
                value: readonly,
                enumerable: true
            }
        });
        Object.freeze(readonly);

        Object.defineProperty(this, '$readonly', {
            value: readonly,
            enumerable: true
        });

        return readonly as any;
    }
    
    public $bind(context: object, binding: _Binding | string) {
        const {
            value: valueKey,
            refs: refsKey
        } = _formatBinding(binding);

        Object.defineProperties(context, {
            [valueKey]: {
                get: () => this.$reactiveValue,
                set: (newValue) => this.$reactiveValue = newValue,
                enumerable: true
            },
            [refsKey]: {
                value: this,
                writable: false,
                enumerable: true
            }
        });
    }

    public static create<M>(value: M): Reference<M> {
        if (isReactive(value)) {
            return value[REFERENCE].$readonly;
        } else {
            return new Reference(value);
        }
    }
}

// /* REACTIVE VALUE HANDLERS (OBJECT, ARRAY, PRIMITIVE) */
// type ReactiveValueHandler<M> = {
//     get: () => M,
//     set: (newValue: M) => boolean,
//     changes$: Observable<M>
// }

// /* REACTIVE OBJECT VALUE HANDLER */
// function reactiveObjectValue<M extends object> (this: Reference<M>): ReactiveValueHandler<M> {
//     const subject: Subject<M> = new Subject();
//     const proxyFactory = objectProxyFactory.bind(this);
//     let proxy: M;

//     return {
//         get: () => proxy ?? (proxy = proxyFactory()),
//         set: (newValue) => {
//             if (newValue !== this.$value) {
//                 this.$value = newValue;
//                 if (isReactive(newValue)) {

//                 }
//                 // TODO: define child references on new object
//                 proxy = proxyFactory();
//             } else {
//                 this.$value = newValue;
//             }
//             subject.next(newValue);
//             return true; // TODO: should this return a bool?
//         },
//         changes$: subject.asObservable()
//     };
// };

// function objectProxyFactory<M extends object>(this: Reference<M>) {
//     const _this = this;
//     const handler = {
//         get(_, key) {
//             if (key === PROXY_HANDLER) return handler;
//             else return _this[key].$reactiveValue;
//         },
//         set(_, key, value) {
//             _this[key].$reactiveValue = value;
//             return true;
//         }
//     };
//     return new Proxy(this.$value, handler);
// }

// /* REACTIVE ARRAY VALUE HANDLER */
// function reactiveArrayValue<M extends Array<any>> (this: Reference<M>): ReactiveValueHandler<M> {
//     const subject: Subject<M> = new Subject();
//     const proxyFactory: (M) => M = arrayProxyFactory.bind(this);
//     let proxy: M;

//     return {
//         get: () => proxy ?? (proxy = proxyFactory(this.$value)),
//         set: (newValue) => {
//             if (newValue !== this.$value) {
//                 proxy = proxyFactory(newValue);
//                 subject.next(newValue);
//             }
//             this.$value = newValue;
//             subject.next(newValue);
//             return true; 
//         },
//         changes$: subject.asObservable()
//     }
// }

// function arrayProxyFactory<M extends Array<any>> (this: Reference<M>, array: M): M {
//     const _this = this;
//     const handler = {
//         get(_, key) {
//             if (key === PROXY_HANDLER) return handler;
//             else return array[key].$reactiveValue ?? array[key];
//         },
//         set(_, key, value) {
//             array[key] = value;
//             return true;
//         }
//     }
//     return new Proxy(array, handler);
// }

// /* REACTIVE PRIMITIVE VALUE HANDLER */
// function reactivePrimitiveValue<M> (this: Reference<M>): ReactiveValueHandler<M> {
//     const subject: Subject<M> = new Subject();

//     return {
//         get: () => this.$value,
//         set: (newValue) => {
//             subject.next(newValue);
//             return true;
//         },
//         changes$: subject.asObservable()
//     }
// }