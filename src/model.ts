import { Property } from "./Property";
import { Context } from "./Context";

export class Model<T> extends Property<T> {
  static #proxyHandler: ProxyHandler<any> = {
    get(target, prop) {
      
    }
  }
}