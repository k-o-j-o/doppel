import { Model } from '../src/model';
import { Property } from '../src/property';

describe('model', () => {
  test('state reflects value', () => {
    const model = Model.for({ value: 'Hello World' });
    console.log(model.state);
    expect(model.state).toEqual({ value: 'Hello World' });
    model.$set({ value: 'hELLO wORLD' });
    expect(model.state).toEqual({ value: 'hELLO wORLD' });
  });

  test('$state reflects model and properties', () => {
    const model = Model.for({ value: 'Hello World' });

    expect(model.$state).toEqual({ ...model, value: Property.for({ value: 'Hello World' }) });
  })
})