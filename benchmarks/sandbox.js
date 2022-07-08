const { suite, add, cycle, complete } = require('benny');

// suite('property creation',
//   add('property with set function', () => {
//     class Thing {
//       thing = 'thing';
//       set(thing) {
//         this.thing = thing;
//       }
//     }
//     return () => {
//       const thing = new Thing();
//       const value = thing.thing;
//       thing.set(value + '1');
//     }
//   }),
//   add('getter/setter', () => {
//     class Thing {
//       #thing = 'thing';
//       get thing() {
//         return this.#thing;
//       }
//       set thing(thing) {
//         this.#thing = thing;
//       }
//     }
//     return () => {
//       const thing = new Thing();
//       const value = thing.thing;
//       thing.thing = value + '1';
//     }
//   }),
//   cycle(),
//   complete()
// );

// suite('retrieving cached value',
//   add('symbol on object', () => {
//     const cached = Symbol('cached');
//     return () => {
//       const value = {};
//       value[cached] = {};
//       const thing = value[cached];
//     }
//   }),
//   add('map', () => {
//     const cache = new Map();
//     return () => {
//       const value = {}
//       cache.set(value, {});
//       const thing = cache.get(value);
//     }
//   }),
//   add('weak map', () => {
//     const cache = new WeakMap();
//     return () => {
//       const value = {};
//       cache.set(value, {});
//       const thing = cache.get(value);
//     }
//   }),
//   cycle(),
//   complete()
// )

// suite('frozen performance',
//   add('unfrozen', () => {
//     const object = { number: 0, string: 'hello', boolean: true, symbol: Symbol('symbol'), nill: null };
//     return () => {
//       const number = object.number;
//       const string = object.string;
//       const boolean = object.boolean;
//       const symbol = object.symbol;
//       const nill = object.nill;
//     }
//   }),
//   add('frozen', () => {
//     const object = Object.freeze({ number: 0, string: 'hello', boolean: true, symbol: Symbol('symbol'), nill: null });
//     return () => {
//       const number = object.number;
//       const string = object.string;
//       const boolean = object.boolean;
//       const symbol = object.symbol;
//       const nill = object.nill;
//     }
//   }),
//   cycle(),
//   complete()
// )

// function getReferenceFor() {
//   return {
//     value: 'value'
//   }
// }

// suite('getting values in proxy trap',
//   add('imperative', () => {
//     const observable = Symbol('observable');
//     const reactive = {
//       references: []
//     }

//     const handler = {
//       get(state, key) {
//         const reactive = state[observable];
//         const reference = reactive.references[key] || (reactive.references[key] = getReferenceFor(state[key]));
//         return reference.value
//       },
//       set(state, key, value) {
//         const reactive = state[observable];
//         const reference = reactive.references[key] || (reactive.references[key] = getReferenceFor(state[key]));
//         state.value = value;
//         reference.value = value;
//         return true;
//       }
//     };

//     const proxy = new Proxy({ [observable]: reactive, number: 0, string: 'hello', boolean: true, nill: null }, handler);

//     return () => {
//       const number = proxy.number;
//       const string = proxy.string;
//       const boolean = proxy.boolean;
//       const nill = proxy.nill;

//       proxy.number = 1;
//       proxy.string = 'hello world';
//       proxy.boolean = false;
//       proxy.nill = null;
//     }
//   }),
//   add('helper function', () => {
//     function helper(state, key) {
//       const reactive = state[observable];
//       return {
//         reactive,
//         reference: reactive.references[key] || (reactive.references[key] = getReferenceFor(state[key]))
//       }
//     };

//     const observable = Symbol('observable');
//     const reactive = {
//       references: []
//     }

//     const handler = {
//       get(state, key) {
//         const { reference } = helper(state, key);
//         return reference.value
//       },
//       set(state, key, value) {
//         const { reference } = helper(state, key);
//         state.value = value;
//         reference.value = value;
//         return true;
//       }
//     };

//     const proxy = new Proxy({ [observable]: reactive, number: 0, string: 'hello', boolean: true, nill: null }, handler);

//     return () => {
//       const number = proxy.number;
//       const string = proxy.string;
//       const boolean = proxy.boolean;
//       const nill = proxy.nill;

//       proxy.number = 1;
//       proxy.string = 'hello world';
//       proxy.boolean = false;
//       proxy.nill = null;
//     }
//   }),
//   cycle(),
//   complete()
// );

// 

// suite('read/write fields',
//   add('public', () => {
//     class Ref {
//       _value;
//       constructor(value) {
//         this._value = value;
//       }

//       get value() {
//         return this._value
//       }

//       set value(value) {
//         this._value = value;
//       }
//     }
//     return () => {
//       const ref = new Ref(0);
//       const value = ref.value;
//       ref.value = value + 1;
//     }
//   }),
//   add('symbol', () => {
//     const $Value = Symbol('value');
//     class Ref {
//       [$Value];
//       constructor(value) {
//         this[$Value] = value;
//       }

//       get value() {
//         return this[$Value];
//       }

//       set value(value) {
//         this[$Value] = value;
//       }
//     }
//     return () => {
//       const ref = new Ref(0);
//       const value = ref.value;
//       ref.value = value + 1;
//     }
//   }),
//   add('private', () => {
//     class Ref {
//       #value;
//       constructor(value) {
//         this.#value = value;
//       }

//       get value() {
//         return this.#value;
//       }

//       set value(value) {
//         this.#value = value;
//       }
//     }
//     return () => {
//       const ref = new Ref(0);
//       const value = ref.value;
//       ref.value = value + 1;
//     }
//   }),
//   cycle(),
//   complete()
// );

const values = Array.from({ length: 100 }, (i) => i);
suite('object creation',
  add('constructor', () => {
    class Ref {
      constructor(value) {
        this._value = value;
      }

      get value() {
        return this._value;
      }

      set value(newValue) {
        this._value = newValue;
      }
    }
    return () => {
      const refs = values.map((val) => new Ref(val));
    }
  }),
  add('factory', () => {
    const Ref = (value) => ({
      get value() {
        return value;
      },
      set value(newValue) {
        value = newValue;
      }
    });

    return () => {
      const refs = values.map((val) => Ref(val));
    }
  }),
  add('Object.create', () => {
    class Ref {
      constructor(value) {
        this._value = value;
      }

      get value() {
        return this._value;
      }

      set value(newValue) {
        this._value = newValue;
      }
    }

    return () => {
      const refs = values.map((value) => Object.create(Ref.prototype, {
        value: {
          get() {
            return value;
          },
          set(newValue) {
            value = newValue;
          }
        }
      }))
    }
  }),
  cycle(),
  complete()
);