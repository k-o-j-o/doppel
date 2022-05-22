import { Reactive, Reference } from '@/index';

describe('reactive', () => {
    test('can create with Reactive.from', () => {
        expect(() => Reactive.from({ 
            user: {
                firstName: "Rick",
                lastName: "Sanchez"
            }
        })).not.toThrow();
    });

    test('Reactive.from returns same instance', () => {
        const reactive = Reactive.from({
            user: {
                firstName: "Rick",
                lastName: "Sanchez"
            }
        });
        expect(Reactive.from(reactive)).toBe(reactive);
    });
    //TODO: duplicating subscribe tests with reference is probably unnecessary and a multicast handler test should be created
    test('is subscribable with function', () => {
        const reactive = Reactive.from({ 
            user: {
                firstName: "Rick",
                lastName: "Sanchez"
            }
        });

        const next = jest.fn();
        reactive.subscribe(next);
        const newValue = {
            user: {
                firstName: "Morty",
                lastName: "Smith"
            }
        };
        reactive.value = newValue;
        expect(next).toBeCalledWith(newValue);
    });

    test('is subscribable with observer', () => {
        const reactive = Reactive.from({
            user: {
                firstName: "Rick",
                lastName: "Sanchez"
            }
        });

        const next = jest.fn();
        reactive.subscribe({ next });
        const newValue = {
            user: {
                firstName: "Morty",
                lastName: "Smith"
            }
        };
        reactive.value = newValue;
        expect(next).toBeCalledWith(newValue);
    });

    test('original state object is observable', () => {
        const state = {
            user: {
                firstName: "Rick",
                lastName: "Sanchez"
            }
        };
        const next = jest.fn();
        const reactive = Reactive.from(state);
        state[Symbol.observable]().subscribe(next);
        reactive.value.user = {
            firstName: "Morty",
            lastName: "Smith"
        };

        expect(next).toBeCalledWith({ 
            user: {
                firstName: "Morty",
                lastName: "Smith"
            }
        });
    })

    test('children trigger subscibers', () => {
        const reactive = Reactive.from({
            user: {
                firstName: "Rick",
                lastName: "Sanchez"
            }
        });

        const next = jest.fn((value) => console.log(value));
        reactive.subscribe(next);

        reactive.value.user.firstName = "Morty";
        expect(next).toBeCalledWith({
            user: {
                firstName: "Morty",
                lastName: "Sanchez"
            }
        });
        reactive.value.user.lastName = "Smith";
        expect(next).toBeCalledWith({
            user: {
                firstName: "Morty",
                lastName: "Smith"
            }
        });
    });

    test('unwraps child references', () => {
        const $firstName = Reference.from("Rick");
        const $lastName = Reference.from("Sanchez");
        const reactive = Reactive.from({
            user: {
                firstName: $firstName,
                lastName: $lastName
            }
        });

        expect(reactive.value.user.firstName).toEqual("Rick");
        expect(reactive.value.user.lastName).toEqual("Sanchez");
    });
    
    test('triggers child refs\' subscribers', () => {
        const $firstName = Reference.from("Rick");
        const $lastName = Reference.from("Sanchez");
        const reactive = Reactive.from({
            user: {
                firstName: $firstName,
                lastName: $lastName
            }
        });

        const firstNameNext = jest.fn();
        const lastNameNext = jest.fn();

        $firstName.subscribe(firstNameNext);
        $lastName.subscribe(lastNameNext);

        reactive.value.user.firstName = "Morty";
        reactive.value.user.lastName = "Smith";

        expect(firstNameNext).toBeCalledWith("Morty");
        expect(lastNameNext).toBeCalledWith("Smith");
    });
    // test('Reference.for returns child references', () => {
    //     const reactive = Reactive.from({
    //         user: {
    //             firstName: "Rick",
    //             lastName: "Sanchez"
    //         }
    //     });

    //     const ref = Reference.for(reactive.value.user.firstName);

    // });
});