import { MetaSymbol, ObjectLiteral, DeepPartial } from '../common';
import { Reference } from '../reference';

export class Store<T extends ObjectLiteral> {
    public data: T;
    public $data: ReferenceMap<T>;

    private constructor(data: T) {
        throwOnInvalidDataType(data);

        this.data = data;
        this.$data = asReferenceMapFrom({}, data);
    }

    public setValue(value: DeepPartial<T>) {
        
    }

    public static create<V extends ObjectLiteral>(data: V): Store<V> {
        if (!data.hasOwnProperty(MetaSymbol.Store)) {
            Object.defineProperty(data, MetaSymbol.Store, { value: new Store(data) });
        }
        return data[MetaSymbol.Store as any] as Store<V>;
    }
}

function throwOnInvalidDataType(data) {
    if (typeof data !== 'object') throw "Cannot construct Store on primitive types";
    if (!data) throw "Cannot construct Store on null or undefined";
    if (Array.isArray(data)) throw "Cannot construct Store on arrays";
}

function asReferenceMapFrom(map, data): ReferenceMap<any> {
    Object.entries(data)
        .forEach((entry) => defineChildReference(map, entry));

    return map;
}

function defineChildReference(map, [ key, value ]) {
    const ref = Reference.create(value);
    Object.defineProperty(map, key, { value: ref, enumerable: true });

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        asReferenceMapFrom(ref, value);
    }
}

type ReferenceMap<T extends ObjectLiteral> = {
    [K in keyof T]: T[K] extends ObjectLiteral
        ? Reference<T[K]> & ReferenceMap<T[K]>
        : Reference<T[K]>
}
