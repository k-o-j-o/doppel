import { DeepPartial, MetaSymbol } from "../common";
import { Observable, Subject } from "rxjs";

export class Reference<T> {
    #subject: Subject<T>;

    public readonly $value: T;
    public readonly $changes: Observable<T>;

    private constructor(value: T) {
        this.#subject = new Subject();

        Object.defineProperties(this, {
            $value: { 
                value, 
                enumerable: true 
            },
            $changes: { 
                value: this.#subject.asObservable(),
                enumerable: true 
            },
            [MetaSymbol.Reference]: { value: this }
        });
    }

    public setValue(value: DeepPartial<T>) {

    }

    public static create<V>(value: V): Reference<V> {
        if (value && typeof value === 'object') {
            if (!value.hasOwnProperty(MetaSymbol.Reference)) {
                Object.defineProperty(value, MetaSymbol.Reference, { value: new Reference(value) });
            }
            return value[MetaSymbol.Reference];
        } else {
            return new Reference(value);
        }
    }

    public static use<V>(val: V): V extends Reference<any> ? V : Reference<V> {
        if (val instanceof Reference) {
            return val as any;
        } else {
            return Reference.create(val) as any;
        }
    }
}

