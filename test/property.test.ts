import { Property, DELETE_SIGNAL } from "../src/property";

describe('property', () => {
  test('.for returns singleton on same object reference', () => {
    const object = {};
    const property1 = Property.for(object);
    const property2 = Property.for(object);
    expect(property1).toBe(property2);
  });

  test('state reflects value', () => {
    const property = Property.for(0);
    expect(property.state).toBe(0);
    property.$set(1);
    expect(property.state).toBe(1);
  });

  test('$state reflects property', () => {
    const property = Property.for(0);
    expect(property.$state).toEqual(property);
  });

  test('$state, $isReactive and $changes are readonly', () => {
    const property: any = Property.for(0);

    expect(() => property.$state = {}).toThrow();
    expect(() => property.$changes = {}).toThrow();
    expect(() => property.$isReactive = {}).toThrow();
  });

  test('is not reactive until changes$ is accessed', () => {
    const property = Property.for(0);
    expect(property.$isReactive).toBe(false);
    property.$changes;
    expect(property.$isReactive).toBe(true);
  });

  test('can subscribe to changes$', () => {
    const property = Property.for(0);

    const newValues = [1, 2, 3, 4, 5];
    const receivedValues = [];

    const callback = jest.fn((num) => receivedValues.push(num));
    property.$changes.subscribe(callback);

    newValues.forEach((num) => property.$set(num));

    expect(callback).toBeCalledTimes(newValues.length);
    expect(receivedValues).toEqual(newValues);
  });

  test('can send delete signal only once', () => {
    const property: Property = Property.for(0);

    const callback = jest.fn();
    property.$changes.subscribe({ complete: callback });
    property.$set(DELETE_SIGNAL);
    property.$set(DELETE_SIGNAL);

    expect(callback).toBeCalledTimes(1);
  });
});