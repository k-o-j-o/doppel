import { Reactive } from "../src/reactive";

test('can subscribe to primitive changes', () => {
    const ref = Reactive.make({
        count: 0
    });

    const listener = jest.fn();
    ref.
})