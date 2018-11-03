import { check, newComponentFromMixin } from '../util'
import mixin from '@/mixins/data'

const mixedComponent = newComponentFromMixin(mixin)

const _func = name => props => mixedComponent(props)[name]

describe('data', () => {
  const func = _func('data')

  const tests = {
    default: { expectation: undefined },
    object: { params: [{ baseData: { a: 1 } }], expectation: { a: 1 } },
    false: { params: [{ baseData: false }], expectation: false },
    true: { params: [{ baseData: true }], expectation: true },
    2: { params: [{ baseData: 2 }], expectation: 2 },
    string: { params: [{ baseData: 'string' }], expectation: 'string' },
    array: { params: [{ baseData: [] }], expectation: [] },
    deep: { params: [{ baseData: { a: { b: [2] } }, conf: { path: 'b/0' }, path: 'a' }], expectation: 2 }
  }
  check(func, tests)
})

describe('items', () => {
  const func = _func('items')
  const tests = {
    default: { expectation: undefined },
    undefinedArray: { params: [{ conf: { items: [true] } }], expectation: [] },
    array: { params: [{ baseData: [1, 2], conf: { items: [true] } }], expectation: [true, true] },
    undefinedObject: { params: [{ conf: { items: { is: 'test' } } }], expectation: [] },
    object: { params: [{ baseData: [1, 2], conf: { items: { is: 'test' } } }], expectation: [{ is: 'test' }, { is: 'test' }] }
  }
  check(func, tests)
})

describe('arrayMethods', () => {
  const data = [1, 2, 3]
  const cmpt = mixedComponent({ baseData: data, baseSchema: { type: 'array', items: { type: 'number' } } })
  const func = (name, ...params) => {
    return cmpt[name](...params)
  }
  const tests = {
    setValue: { params: ['setValue'], expectation: [1, 2, 3, 0] },
    setValueValue: { params: ['setValue', 1, 4], expectation: [1, 4, 3, 0] },
    unsetValue: { params: ['unsetValue', 0], expectation: [4, 3, 0] },
    moveItem: { params: ['moveItem', 1, 1], expectation: [4, 3, 0] },
    moveItemNext: { params: ['moveItem', 0, 2], expectation: [3, 0, 4] },
    moveItemPrev: { params: ['moveItem', 2, 0], expectation: [4, 3, 0] },
    moveItemBackward: { params: ['moveItemBackward', 2], expectation: [4, 0, 3] },
    moveItemForward: { params: ['moveItemForward', 0], expectation: [0, 4, 3] },
    insertItem: { params: ['insertItem', 1, 6], expectation: [0, 6, 4, 3] },
    insertItemValue: { params: ['insertItem'], expectation: [0, 6, 4, 3, 0] },
    clear: { params: ['clear'], expectation: [] }
  }
  check(func, tests)
})

describe('objectMethods', () => {
  const data = { 1: 1, 2: 2, 3: 3 }
  const cmpt = mixedComponent({ baseData: data, baseSchema: { properties: { a: { type: 'number' } } } })
  const func = (name, ...params) => {
    return cmpt[name](...params)
  }
  const tests = {
    setValue: { params: ['setValue', 'a'], expectation: { 1: 1, 2: 2, 3: 3, a: 0 } },
    setValueValue: { params: ['setValue', 'a', 3], expectation: { 1: 1, 2: 2, 3: 3, a: 3 } },
    setValueError: { params: ['setValue'], error: true },
    unsetValue: { params: ['unsetValue', 'a'], expectation: { 1: 1, 2: 2, 3: 3 } },
    clear: { params: ['clear'], expectation: {} }
  }
  check(func, tests)
})
