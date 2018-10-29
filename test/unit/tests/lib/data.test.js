import {getValue, setValue} from '@/lib/data'

describe('getValue', () => {
  const data = {
    0: {
      1: {
        2: 3
      }
    }
  }
  const values = {
    undefined: {params: [undefined], expectation: undefined},
    null: {params: [null], expectation: null},
    object: {params: [{}], expectation: {}},
    true: {params: [true], expectation: true},
    false: {params: [false], expectation: false},
    1: {params: [1], expectation: 1},
    0.1: {params: [0.1], expectation: 0.1},
    '': {params: [''], expectation: ''},
    'az': {params: ['az'], expectation: 'az'},
    undefinedA: {params: [undefined, 'a'], expectation: undefined},
    nullA: {params: [null, 'a'], expectation: undefined},
    objectA: {params: [{}, 'a'], expectation: undefined},
    trueA: {params: [true, 'a'], expectation: undefined},
    falseA: {params: [false, 'a'], expectation: undefined},
    a1: {params: [1, 'a'], expectation: undefined},
    a0a1: {params: [0.1, 'a'], expectation: undefined},
    a: {params: ['', 'a'], expectation: undefined},
    aaz: {params: ['az', 'a'], expectation: undefined},
    absolute: {params: [data, '/0/1'], expectation: data[0][1]},
    absoluteBis: {params: [data, '/0/1/'], expectation: data[0][1]},
    absoluteBisBis: {params: [data, '/0/1/.'], expectation: data[0][1]},
    absoluteBack: {params: [data, '/0/1/..'], expectation: data[0]},
    absoluteBackBack: {params: [data, '/../..'], expectation: data}
  }
  Object.entries(values).forEach(
    ([key, {params, expectation}]) => {
      it(key, () => {
        expect(getValue(...params)).toEqual(expectation)
      })
    }
  )
})

describe('setValue', () => {
  it('', () => {
  })
})
