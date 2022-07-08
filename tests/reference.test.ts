import { Ref } from '@/index';

describe('reference', () => {
  test('is subscribable with function', () => {
    const ref = Ref.from(0);

    const next = jest.fn();
    ref.subscribe(next);
    ref.value = 1;

    expect(next).toBeCalledWith(1)
  });

  test('is subscribable with observer', () => {
    const ref = Ref.from(0);

    const next = jest.fn();
    ref.subscribe({ next });
    ref.value = 1;

    expect(next).toBeCalledWith(1);
  });

  test('can unsubscribe', () => {
    const ref = Ref.from(0);

    const next = jest.fn();
    const subscription = ref.subscribe(next);

    ref.value = 1;
    subscription.unsubscribe();
    subscription.unsubscribe();
    ref.value = 2;

    expect(next).toBeCalledWith(1);
    expect(next).toBeCalledTimes(1);
    expect(subscription.closed).toEqual(true);
  });

  test('multicasts to subscribers', () => {
    const ref = Ref.from(0);

    const next1 = jest.fn();
    const subscription1 = ref.subscribe(next1);
    const next2 = jest.fn();
    const subscription2 = ref.subscribe(next2);
    const next3 = jest.fn();
    const subscription3 = ref.subscribe(next3);

    ref.value = 1;
    subscription1.unsubscribe();
    ref.value = 2;
    subscription2.unsubscribe();
    ref.value = 3;
    subscription3.unsubscribe();

    expect(next1).toHaveBeenNthCalledWith(1, 1);
    expect(next2).toHaveBeenNthCalledWith(2, 2);
    expect(next3).toHaveBeenNthCalledWith(3, 3);
  });

  test('subscriber order is honored', () => {
    const ref = Ref.from(0);

    const values = [];
    const next1 = jest.fn(() => values.push(1));
    const subscription1 = ref.subscribe(next1);
    const next2 = jest.fn(() => values.push(2));
    const subscription2 = ref.subscribe(next2);
    const next3 = jest.fn(() => values.push(3));
    const subscription3 = ref.subscribe(next3);

    ref.value++;
    subscription3.unsubscribe();
    ref.value++;
    subscription1.unsubscribe();
    ref.value++;

    expect(values).toEqual([1, 2, 3, 1, 2, 2]);
  });

  test('from returns same instance', () => {
    const ref1 = Ref.from(0);
    const ref2 = Ref.from(ref1);

    expect(ref1).toBe(ref2);
  });

  test('for returns same instance', () => {
    const ref1 = Ref.from(0);
    const ref2 = Ref.for(ref1.value);

    expect(ref1).toBe(ref2);
  });

  test('for works for arrays', () => {
    const ref1 = Ref.from(0);
    const ref2 = Ref.from('string');
    const ref3 = Ref.from(true);

    const references = Ref.for(ref1.value, ref2.value, ref3.value);
    expect(references).toEqual(expect.arrayContaining([ref1, ref2, ref3]));
    expect(references.length).toEqual(3);
  });

  test('value synchronously tracks updates', () => {
    const ref = Ref.from(0);
    ref.value++;
    expect(ref.value).toEqual(1);
  });
})