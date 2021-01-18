export const MetaSymbol = {
    Store: Symbol('store'),
    Reference: Symbol('reference')
}

export type ObjectLiteral = { [k: string]: unknown };
export type DeepPartial<T> = {
        [P in keyof T]?: DeepPartial<T[P]>;
};