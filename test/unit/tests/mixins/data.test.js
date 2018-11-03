import { check, newComponentFromMixin } from '../util'
import mixin from '@/mixins/data'

const mixedComponent = newComponentFromMixin(mixin)

const _func = name => props => mixedComponent(props)[name]

describe('errors', () => {
  const func = _func('errors')
  const tests = {
    default: { expectation: false }
  }
  check(func, tests)
})

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
    cmpt[name](...params)
    return cmpt.data
  }
  const tests = {
    addItem: { params: ['addItem'], expectation: [1, 2, 3, 0] },
    addItemIndex: { params: ['addItem', 1, 4], expectation: [1, 4, 2, 3, 0] },
    removeItem: { params: ['removeItem', 0], expectation: [4, 2, 3, 0] },
    moveItem: { params: ['moveItem', 1, 1], expectation: [4, 2, 3, 0] },
    moveItemNext: { params: ['moveItem', 0, 3], expectation: [2, 3, 0, 4] },
    moveItemPrev: { params: ['moveItem', 3, 0], expectation: [4, 2, 3, 0] },
    moveBackward: { params: ['moveBackward', 3], expectation: [4, 2, 0, 3] },
    moveUpward: { params: ['moveUpward', 0], expectation: [2, 4, 0, 3] },
    clear: { params: ['clear'], expectation: [] }
  }
  check(func, tests)
})

describe('objectMethods', () => {

})
