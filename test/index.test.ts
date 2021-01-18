import { Store } from "../src/store"

describe('store creation', () => {
    test('throws on primitives', () => {
        expect(() => {
            Store.create(0 as any);
        }).toThrow();
    });
    
    test('throws on null or undefined', () => {
        expect(() => {
            Store.create(null);
        }).toThrow()
    });
    
    test('throws on arrays', () => {
        expect(() => {
            Store.create([] as any);
        }).toThrow()
    });
    
    test('maps primitives', () => {
        const store = Store.create({
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
        const store = Store.create({
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
        const store = Store.create({
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
        const store = Store.create({
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
        const store = Store.create(data);
        const storeCopy = Store.create(data);
        
        expect(store).toBe(storeCopy);
    })
});