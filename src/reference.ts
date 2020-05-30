class _Reference<Model extends object> {
    constructor(
        public value: Model
    ) { }

    public bind(context: object, binding: _Binding | string) {
        const { value, refs } = _destructureBinding(binding);

        Object.defineProperties(context, {
           [value]: { 
               value: this.value,
               enumerable: true,
               writable: false
            },
           [refs]: {
               value: this.value,
               enumerable: true,
               writable: false
            }
        });
    }
}

type _Binding = {
    value: string;
    refs: string;
}

function _destructureBinding(binding: _Binding | string): _Binding {
    if (typeof binding === 'object') {
        return binding;
    } else {
        return { value: binding, refs: `$${binding}` }
    }
}

export function reference(value: object) {
    return new _Reference(value);
}