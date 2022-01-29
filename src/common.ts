import { Reference } from ".";

export const MetaSymbol = {
    Store: Symbol('store'),
    Reference: Symbol('reference'),
    ReferenceMap: Symbol('reference-map'),
    IsUpdate: Symbol('is-update')
}

export function isReferenceMap(thing: any): thing is ReferenceMap<any> {
    return thing.hasOwnProperty(MetaSymbol.ReferenceMap);
} 

export type ObjectLiteral = { 
    [k: string]: unknown 
};

export type DeepPartial<T> = {
        [P in keyof T]?: DeepPartial<T[P]>;
};

export type ReferenceMap<T extends ObjectLiteral> = {
    [K in keyof T]: T[K] extends ObjectLiteral
        ? Reference<T[K]> & ReferenceMap<T[K]>
        : Reference<T[K]>
}