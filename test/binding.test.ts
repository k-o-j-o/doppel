import { reference } from '../src/reference';

const REF = reference({ message: 'hello world' });

test('binds with binding config', () => {
    const context = { };

    REF.bind(context, { value: 'state', refs: '$state' });
    expect(context).toBe(
        expect.objectContaining({
            state: REF.value,
            $state: REF.value
        })
    );
})