import { Store } from "../src/store"

describe('store creation', () => {
    test('throws on primitives', () => {
        expect(() => {
            Store.use(0 as any);
        }).toThrow();
    });
    
    test('throws on null or undefined', () => {
        expect(() => {
            Store.use(null);
        }).toThrow()
    });
    
    test('throws on arrays', () => {
        expect(() => {
            Store.use([] as any);
        }).toThrow()
    });
    
    test('maps primitives', () => {
        const store = Store.use({
            string: "string",
            boolean: true,
            number: 0,
            nill: null,
            undef: undefined,
            symbol: Symbol('symbol')
        });

        expect(store.$data).toEqual(
            expect.objectContaining({
                string: expect.objectContaining({ $value: store.data.string }),
                boolean: expect.objectContaining({ $value: store.data.boolean }),
                number: expect.objectContaining({ $value: store.data.number }),
                nill: expect.objectContaining({ $value: store.data.nill }),
                undef: expect.objectContaining({ $value: store.data.undef }),
                symbol: expect.objectContaining({ $value: store.data.symbol }),
            })
        );
    });

    test('maps arrays', () => {
        const store = Store.use({
            array: [{ message: "hello" }]
        });

        expect(store.$data).toEqual(
            expect.objectContaining({
                array: expect.objectContaining({
                    $value: expect.arrayContaining(store.data.array)
                })
            })
        );
    })

    test('maps objects', () => {
        const store = Store.use({
            user: {
                first: "Rick",
                last: "Sanchez"
            }
        });

        expect(store.$data).toEqual(
            expect.objectContaining({
                user: expect.objectContaining({
                    $value: store.data.user,
                    first: expect.objectContaining({ $value: store.data.user.first }),
                    last: expect.objectContaining({ $value: store.data.user.last })
                })
            })
        );
    });

    test('maps nested objects', () => {
        const store = Store.use({
            user: {
                name: {
                    first: "Rick",
                    last: "Sanchez"
                }
            }
        });

        expect(store.$data).toEqual(
            expect.objectContaining({
                user: expect.objectContaining({
                    $value: store.data.user,
                    name: expect.objectContaining({ 
                        $value: store.data.user.name,
                        first: expect.objectContaining({ $value: store.data.user.name.first }),
                        last: expect.objectContaining({ $value: store.data.user.name.last })
                    })
                })
            })
        );
    });

    test('returns singleton', () => {
        const data = { message: "hello" };
        const store = Store.use(data);
        const storeCopy = Store.use(data);
        
        expect(store).toBe(storeCopy);
    })
});