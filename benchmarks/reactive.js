const { suite, add, cycle, complete } = require('benny');

// suite('Subscription creation',
//   add('Factory', () => {
//     class R1 {
//       #observers = [];

//       subscribe(next, error, complete) {
//         if (typeof next !== 'object' || next === null) {
//           next = { next, error, complete }
//         }
//         this.#observers.push(next);
//         return R1.#SUBSCRIPTION_FACTORY(this, next);
//       }

//       static #SUBSCRIPTION_FACTORY = (reactive, observer) => ({
//         get closed() {
//           return reactive.#observers.indexOf(observer) === -1
//         },
//         unsubscribe() {
//           reactive.#observers.splice(
//             reactive.#observers.indexOf(observer),
//             1
//           );
//         }
//       })
//     }
//     const thing = new R1();
//     return () => thing.subscribe((value) => console.log(value))
//   }),
//   add('Direct return', () => {
//     class R2 {
//       #observers = [];

//       subscribe(next, error, complete) {
//         const observers = this.#observers;
//         if (typeof next !== 'object' || next === null) {
//           next = { next, error, complete }
//         }
//         observers.push(next);
//         return {
//           get close() {
//             observers.indexOf(next) === -1
//           },
//           unsubscribe() {
//             observers.splice(observers.indexOf(next), 1);
//           }
//         }
//       }
//     }
//     const thing = new R2();
//     return () => thing.subscribe((value) => console.log(value));
//   }),
//   cycle(),
//   complete()
// );

suite('singleton proxy handler vs proxy handler factory',
  add('factory', () => {
    const symbolObservable = Symbol('observable');

    class Reactive {
      constructor(state) {
        this.handler = handlerFactory(this);
        state[symbolObservable] = this;
        this.state = new Proxy(state, this.handler);
        this.references = {};
      }

      get value() {
        return this.state;
      }

      set value(value) {
        value[symbolObservable] = this;
        this.state = new Proxy(value, this.handler);
        return true;
      }
    }

    const handlerFactory = (reactive) => ({
      get(state, key) {
        if (typeof state[key] === 'object') {
          const thing = state[symbolObservable];
          const ref = thing.references[key] || (thing.references[key] = new Reactive(state[key]))
          return ref.value;
        } else {
          return state[key];
        }
      },
      set(state, key, value) {
        if (typeof state[key] === 'object') {
          const thing = state[symbolObservable];
          const ref = thing.references[key] || (thing.references[key] = new Reactive(state[key]))
          ref.value = value;
        } else {
          state[key] = value;
        }
        return true;
      }
    });

    return () => {
      const reactive = new Reactive({
        user: {
          firstName: "Rick",
          lastName: "Sanchez"
        }
      });

      let firstName = reactive.value.user.firstName;
      let lastName = reactive.value.user.lastName;

      reactive.value = {
        user: {
          firstName: firstName + "1",
          lastName: lastName + "1"
        }
      };
    }
  }),
  add('singleton', () => {
    const symbolObservable = Symbol('observable');

    class Reactive {
      constructor(state) {
        this.state = new Proxy(
          Object.defineProperty(state, symbolObservable, { value: this }),
          HANDLER
        );
        this.references = {};
      }

      get value() {
        return this.state;
      }

      set value(value) {
        this.state = new Proxy(
          Object.defineProperty(value, symbolObservable, { value: this }),
          HANDLER
        );
        return true;
      }
    }

    const HANDLER = {
      get(state, key) {
        if (typeof state[key] === 'object') {
          const reactive = state[symbolObservable];
          const ref = reactive.references[key] || (reactive.references[key] = new Reactive(state[key]))
          return ref.value;
        } else {
          return state[key];
        }
      },
      set(state, key, value) {
        if (typeof state[key] === 'object') {
          const reactive = state[symbolObservable];
          const ref = reactive.references[key] || (reactive.references[key] = new Reactive(state[key]))
          ref.value = value;
        } else {
          state[key] = value;
        }
        return true;
      }
    }

    return () => {
      const reactive = new Reactive({
        user: {
          firstName: "Rick",
          lastName: "Sanchez"
        }
      });

      let firstName = reactive.value.user.firstName;
      let lastName = reactive.value.user.lastName;

      reactive.value = {
        user: {
          firstName: firstName + "1",
          lastName: lastName + "1"
        }
      };
    }
  }),
  cycle(),
  complete()
);