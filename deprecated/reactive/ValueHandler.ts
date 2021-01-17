import { Subject } from "rxjs";
import { Reactive } from ".";

export const REFERENCE: unique symbol = Symbol('reference');

const FValueHandler = (function() {
    function ValueHandler<M>(this: any, ref: Reactive<M>) {
        this.ref = ref;
    }

    ValueHandler.prototype.activate = function() {

    }
})
FValueHandler.prototype.reference = null;
FValueHandler.prototype.activate = function() {
    this.subject = new Subject();
}
export class ValueHandler<M> {
    protected value: M;
    public subject: Subject<M>;

    protected constructor(
        protected ref: Reactive<M>
    ) { }

    public activate() {
        this.subject = new Subject();
    }

    public getValue(): M {
        return this.value;
    }

    public setValue(newValue: M) {
        this.value = newValue;
        this.subject?.next(newValue);
    }

    public static create<M>(ref: Reactive<M>): ValueHandler<M> {
        if (typeof ref.$value !== 'object') return new ValueHandler(ref);
        else if (Array.isArray(ref.$value)) return new ArrayValueHandler(ref as any) as any;
        else return new ObjectValueHandler(ref as any) as any;
    }
}

class ObjectValueHandler<M extends object> extends ValueHandler<M> implements ProxyHandler<M> {
    #proxy: M;

    constructor(ref) {
        super(ref);
    }

    public activate() {
        super.activate();
        this.#proxy = new Proxy(this.value, this);
    }

    public getValue() {
        return this.#proxy || this.value;
    }

    public setValue(newValue: M) {
        if (this.value !== newValue) { 
            this.initValue(newValue); 
        }
        super.setValue(newValue);
    }

    protected initValue(value) {
        
        if (value) {
            Object.defineProperty(value, REFERENCE, { value: this.ref }); //TODO: throw a warning if a ref is already attached?
            
        } else if (this.value)
        if(this.#proxy) {
            this.#proxy = new Proxy(value, this); //Don't create a new proxy unless this handler has been activated
        }
    }

    get(_, key) {
        return this.ref[key].$value;
    }

    set(_, key, value) {
        this.ref[key].$value = value;
        return true;
    }

    private defineChildReference([ key, value ]) {

    }

    private removeChildReference() {

    }
}

class ArrayValueHandler<M extends Array<any>> extends ValueHandler<M> implements ProxyHandler<M> {
    public getValue(): M {
        throw new Error("Method not implemented.");
    }

    public setValue(newValue: M) {
        throw new Error("Method not implemented.");
    }

    get(_, key) {
        throw new Error("Method not implemented.");
    }
}