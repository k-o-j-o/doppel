import { Property, PROPERTY_FOR, DELETE_SIGNAL } from "./Property";
import { Context, Action } from "./Context";

//@ts-ignore: TS doesn't like <T extends object> on Model.for because Property.for doesnt have it
export class Model<T extends object = any> extends Property<T> {
  #properties: Partial<PropertyMap<T>> = {};
  readonly $state: Model<T> & PropertyMap<T>;

  protected constructor(state: T) {
    super(state);
    Object.defineProperties(this, {
      state: { value: new Proxy(state, Model.#STATE_HANDLER_FACTORY(this)) },
      $state: { value: new Proxy(this, Model.#REFLECTION_HANDLER), writable: false }
    });
  }

  static for<T extends object>(value: T): Model<T> {
    //TODO: this will make it impossible for a value to start as a property then turn into a model
    return value[PROPERTY_FOR] || (value[PROPERTY_FOR] = new Model(value));
  }

  static readonly #STATE_HANDLER_FACTORY = (model: Model): ProxyHandler<any> => ({
    get(state, key: string) {
      const property = model.#properties[key] || (model.#properties[key] = Property.for(state[key]));
      Context.INSTANCE.actions.push(Action.get(property, state[key]));
      return property.state
    },
    set(state, key: string, value) {
      const property = model.#properties[key] || (model.#properties[key] = Property.for(state[key]));
      Context.INSTANCE.actions.push(Action.set(property, value));
      property.$set(value)
      return true; //TODO: should this ever return false?
    },
    deleteProperty(state, key: string) {
      const property = model.#properties[key];
      delete state[key];
      if (property) {
        Context.INSTANCE.actions.push(Action.delete(property, property.state));
        property.$set(DELETE_SIGNAL);
        delete model.#properties[key];
      }
      return true; //TODO: should this ever return false?
    }
  });

  static #REFLECTION_HANDLER: ProxyHandler<Model> = {
    get(model, prop: string) {
      return model[prop] || model.#properties[prop]?.$state || (model.#properties[prop] = Property.for(undefined)).$state;
    }
  }
}

type PropertyMap<T> = {
  [Prop in keyof T]: Property<T[Prop]>;
}
