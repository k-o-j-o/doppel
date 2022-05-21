import { Reference, Effect, Schedule } from '@/index';

describe('effect', () => {
  test('does not run until register is called', () => {
    const func = jest.fn();
    const effect = new Effect(func);
    expect(func).toBeCalledTimes(0);
    effect.register();
    expect(func).toBeCalledTimes(1);
  });

  test('does not run on subsequent calls to register', () => {
    const func = jest.fn();
    const effect = new Effect(func);
    effect.register();
    effect.register();
    expect(func).toBeCalledTimes(1);
  });

  test('can use static register helper', () => {
    const func = jest.fn();
    Effect.register(func);
    expect(func).toBeCalledTimes(1);
  });

  test('tracks dependencies', () => {
    const ref1 = Reference.from(0);
    const ref2 = Reference.from('string');
    const ref3 = Reference.from(true);
    const values = [];
    const effect = Effect.register(() => {
      values.push(ref1.value);
      values.push(ref2.value);
      values.push(ref3.value);
    });

    expect(effect.dependencies).toEqual([ref1, ref2, ref3]);
    expect(values).toEqual([0, 'string', true]);
  });

  test('queues invocations by default', (done) => {
    const ref = Reference.from(0);
    const values = [];
    Effect.register(() => values.push(ref.value));
    ref.value++;
    ref.value++;

    expect(values).toEqual([0]);
    setTimeout(() => {
      expect(values).toEqual([0, 2]);
      done();
    });
  });

  test('can use custom scheduler', (done) => {
    const ref = Reference.from(0);
    const values = [];
    Effect.register(() => values.push(ref.value), Schedule.Sync);
    ref.value++;
    ref.value++;
    expect(values).toEqual([0, 1, 2]);
    setTimeout(() => {
      expect(values).toEqual([0, 1, 2]);
      done();
    })
  });

  test('can add/remove dependencies', () => {
    const ref1 = Reference.from(0);
    const ref2 = Reference.from(1);
    const values = [];
    const func = jest.fn(() => values.push(ref1.value));
    const effect = Effect.register(func, Schedule.Sync);

    effect.removeDependency(ref1);
    ref1.value++;
    expect(func).toBeCalledTimes(1);

    effect.addDependency(ref2);
    ref2.value++;
    expect(func).toBeCalledTimes(2);
  });
});