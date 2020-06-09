import { reference } from '../src/reference';

const REF = reference({
    message: 'hello world',
    object: {
        number: 1,
        string: 'string',
        object2: {
            number: 2
        }
    }
});

test('binds with binding config', () => {
    const context = { };
    REF.$bind(context, { value: 'state', refs: '$state' });
    
    expect(context).toEqual(
        expect.objectContaining({
            state: REF.$value,
            $state: expect.objectContaining({ $value: REF.$value })
        })
    );
});

test('binds with string', () => {
    const context = { };
    REF.$bind(context, 'state');

    expect(context).toEqual(
        expect.objectContaining({
            state: REF.$value,
            $state: expect.objectContaining({ $value: REF.$value })
        })
    );
});

test('object reference is a reference map', () => {
    expect(REF).toEqual(
        expect.objectContaining({
            $value: REF.$value,
            message: { $value: REF.$value.message },
            object: {
                $value: REF.$value.object,
                number: { $value: REF.$value.object.number },
                string: { $value: REF.$value.object.string },
                object2: {
                    $value: REF.$value.object.object2,
                    number: { $value: REF.$value.object.object2.number }
                }
            }
        })
    )
})