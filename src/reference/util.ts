import { Reference, reference } from '.'

export type ReferenceMap<Model> = Model extends object 
    ? { 
        readonly [Prop in keyof Model]: Model[Prop] extends object 
            ? (ReferenceMap<Model[Prop]> & Reference<Model[Prop]>)
            : Reference<Model[Prop]>
    } : Reference<Model>

export type _Binding = {
    value: string;
    refs: string;
}

export function _defineChildReference(this: Reference<any>, [ key, value ]: [string,any]) {
    const ref = reference(value);
    ref._onInitChanges(() => this._activate());
    ref._onActivate((reactiveValue) => Object.defineProperty(this.$value, key, {
        value: reactiveValue,
        writable: true,
        enumerable: true
    }));

    Object.defineProperty(this, key, {
        value: ref,
        writable: false,
        enumerable: true
    });
}

export function _formatBinding(binding: _Binding | string): _Binding {
    if (typeof binding === 'object') {
        return binding;
    } else {
        return { value: binding, refs: `$${binding}` }
    }
}

export function _proxyFactory<V extends object>(this: Reference<V> & ReferenceMap<V>) {
    const _this = this;
    return new Proxy(this.$value, {
        set(target, prop, newValue) {
            (_this[prop] as Reference<any>)._triggerChanges(newValue)
            return true;
        }
    })
}

export function _descriptorFactory<V extends object>(this: Reference<V>): PropertyDescriptor {
    return {
        value: this.$value,
        set: this._triggerChanges
    }
}