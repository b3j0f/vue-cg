import { check, newComponentFromMixin } from '../util'
import mixin from '@/mixins/schema'

const baseSchema = {
  properties: {
    a: {
      type: 'array',
      items: {
        properties: {
          c: {}
        }
      }
    }
  }
}

const component = newComponentFromMixin(mixin)({ baseSchema })

describe('schema', () => {
  it('schema', () => expect(component.schema).toEqual(baseSchema))
})

describe('getSchema', () => {
  const func = path => component.getSchema(path)
  const tests = {
    default: { params: [], expectation: baseSchema },
    relative: { params: ['.././a/./b/.././'], expectation: baseSchema.properties.a },
    absolute: { params: ['.././a/./b/.././0'], expectation: baseSchema.properties.a.items }
  }
  check(func, tests)
})

describe('getDefaultValue', () => {
  const func = path => component.getDefaultValue(path)
  const tests = {
    default: { params: [], expectation: { a: [] } },
    relative: { params: ['.././a/./b/.././'], expectation: [] },
    absolute: { params: ['.././a/./b/.././0'], expectation: { c: {} } }
  }
  check(func, tests)
})
