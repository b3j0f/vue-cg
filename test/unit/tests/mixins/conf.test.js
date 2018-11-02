import { check, newComponentFromMixin } from '../util'
import mixin from '@/mixins/conf'

const mixedComponent = newComponentFromMixin(mixin)
const component = (conf, confs) => mixedComponent({ conf, confs })

const _func = name => (conf, confs) => component(conf, confs)[name]

const fill = (conf = {}) => {
  const fillName = (name, value) => {
    if (conf[name] === undefined) {
      conf[name] = value
    }
  }
  // ['containers', 'before', 'after', 'children'].forEach(name => fillName(name, []))
  fillName('is', 'div')
  fillName('show', true)
  return conf
}

describe('finalConf', () => {
  const func = _func('finalConf')

  const tests = {
    default: { expectation: fill() },
    true: { params: [true], expectation: fill() },
    false: { params: [false], expectation: { show: false } },
    string: { params: ['test'], expectation: fill({ is: 'test' }) },
    func: { params: [() => ({ path: 'a' })], expectation: fill({ path: 'a' }) },
    onces: { params: [{ children: true, containers: true, before: true, after: true }], expectation: fill({ children: [true], before: [true], after: [true], containers: [true] }) },
    wrongConfType: { params: [() => 2], error: true }
  }
  check(func, tests)
})

describe('mixins', () => {
  const func = _func('finalConf')

  const tests = {
    string: { params: [{ is: 'password', mixins: 'is' }], expectation: fill({ is: 'input' }) },
    function: { params: [{ is: 'default', mixins: () => ({ is: 'toto' }) }], expectation: fill() },
    true: { params: [{ is: 'default', mixins: true }], expectation: fill() },
    array: { params: [{ is: 'default', mixins: ['is'] }], expectation: fill() },
    object: { params: [{ is: 'default', mixins: { is: true } }], expectation: fill() },
    objectFunction: { params: [{ is: 'default', mixins: { is: val => val } }], expectation: fill() },
    error: { params: [{ is: 'default', mixins: 2 }], error: true }
  }
  check(func, tests)
})

describe('innerConf', () => {
  const func = _func('innerConf')

  const tests = {
    default: { expectation: fill() },
    manyContainers: { params: [{ before: true, containers: [true, true] }], expectation: fill({ containers: [true], before: [true] }) },
    oneContainer: { params: [{ before: true, containers: [true] }], expectation: fill() }
  }
  check(func, tests)
})

describe('container', () => {
  const func = _func('container')
  const tests = {
    default: { expectation: undefined },
    manyContainers: { params: [{ containers: [false, true] }], expectation: false },
    oneContainer: { params: [{ containers: true }], expectation: true }
  }
  check(func, tests)
})

describe('methods', () => {
  const cmpt = component()
  expect(cmpt.resolve()).toEqual(undefined)
})

describe('properties', () => {
  const func = _func('properties')
  const tests = {
    true: { params: [{ properties: true }], expectation: {} },
    array: { params: [{ properties: ['a'] }], expectation: { a: { is: 'a', show: true } } },
    object: { params: [{ properties: { a: true } }], expectation: { a: { is: 'div', show: true } } },
    string: { params: [{ properties: 'a' }], expectation: { is: 'a', show: true } }
  }
  check(func, tests)
  it('trueSchema', () => {
    const cmpt = mixedComponent({ conf: { properties: true }, baseSchema: { properties: { a: { type: 'number' } } } })
    expect(cmpt.properties).toEqual({ a: fill() })
  })
})
