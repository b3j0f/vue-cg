import { check, newComponent } from '../util'
import mixin from '@/mixins/path'

const component = path => newComponent(mixin)({ path })

describe('props', () => {
  const func = path => {
    const elt = component(path)
    return {
      name: elt.name,
      finalPath: elt.finalPath
    }
  }
  const tests = {
    default: { params: [], expectation: { name: '', finalPath: '/' } },
    a: { params: ['a'], expectation: { name: 'a', finalPath: '/a' } },
    composition: { params: ['.././a/.././b/c/d/.././'], expectation: { name: 'c', finalPath: '/b/c' } }
  }
  check(func, tests)
})

describe('concatPath', () => {
  const func = (path, concat) => component(path).concatPath(concat)
  const tests = {
    default: { params: [], expectation: '/' },
    relative: { params: ['.././a/./b/.././', 'c/f/g/./..'], expectation: '/a/c/f' },
    absolute: { params: ['.././a/./b/.././', '/d/e/.././'], expectation: '/d' }
  }
  check(func, tests)
})
