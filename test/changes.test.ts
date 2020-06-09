import { reference, Reference } from "../src/reference"

test('can subscribe to primitive changes', () => {
    const ref = reference({ 
        count: 0
    });

    const listener = jest.fn();

    ref.count.changes$.subscribe(listener);

    ref.$reactiveValue.count++;

    expect(listener).toBeCalledWith(1);
});

test('can subscribe to object changes', () => {
    const ref = reference({
        count: 0,
        user: {
            firstName: 'Rick',
            lastName: 'Sanchez'
        }
    });

    const listener = jest.fn();

    ref.user.changes$.subscribe(listener);

    ref.$reactiveValue.user = { 
        firstName: 'Morty',
        lastName: 'Smith'
    }

    expect(listener).toHaveBeenCalledWith({ 
        firstName: 'Morty',
        lastName: 'Smith'
    });
});

test('can be bound', () => {
    const obj = {} as any;
    reference({
        count: 0,
        user: {
            firstName: 'Rick',
            lastName: 'Sanchez'
        }
    }).$bind(obj, 'state');

    const listener = jest.fn();

    obj.$state.count.changes$.subscribe(listener);
    obj.$state.user.changes$.subscribe(listener);

    obj.state.count++;
    obj.state.user = { };

    expect(listener).toHaveBeenCalledTimes(2);
});