import { check } from '../util'
import { getDefaultValue, getSchema, generateSchema } from '@/lib/schema'

describe('getDefaultValue', () => {
  const tests = {
    undefined: { expectation: { } },
    number: { params: [{ type: 'number' }], expectation: 0 },
    string: { params: [{ type: 'string' }], expectation: '' },
    boolean: { params: [{ type: 'boolean' }], expectation: false },
    array: { params: [{ type: 'array' }], expectation: [] },
    default: { params: [{ default: { a: 1 } }], expectation: { a: 1 } },
    objectArray: { params: [{ type: 'array', items: { type: 'object' }, minItems: 1 }], expectation: [{ }] },
    arrayArray: { params: [{ type: 'array', items: [{ type: 'number' }], minItems: 2 }], expectation: [0, { }] },
    object: { params: [{ type: 'object', properties: { a: { type: 'number' } } }], expectation: { a: 0 } }
  }
  check(getDefaultValue, tests)
})

describe('getSchema', () => {
  const tests = {
    undefined: { expectation: { } },
    string: { params: [{ type: 'string' }, 'a'], expectation: undefined },
    number: { params: [{ type: 'number' }, 'a'], expectation: undefined },
    boolean: { params: [{ type: 'boolean' }, 'a'], expectation: undefined },
    object: { params: [{ type: 'object' }, 'a'], expectation: { } },
    objectProperties: { params: [{ type: 'object', properties: { a: { type: 'object' } } }, 'a'], expectation: { type: 'object' } },
    objectPatternProperties: { params: [{ type: 'object', patternProperties: { 'a': { type: 'number' } } }, 'a'], expectation: { type: 'number' } },
    array: { params: [{ type: 'array' }, 'a'], expectation: { } },
    arrayArray: { params: [{ type: 'array', items: [{ type: 'number' }] }, '0'], expectation: { type: 'number' } },
    arrayObject: { params: [{ type: 'array', items: { type: 'number' } }, '0'], expectation: { type: 'number' } },
    arrayAdditionalItems: { params: [{ type: 'array', additionalItems: { type: 'number' } }, '0'], expectation: { type: 'number' } }
  }
  check(getSchema, tests)
})

describe('generateSchema', () => {
  const tests = {
    undefined: { expectation: { type: 'object' } },
    null: { expectation: { type: 'object' } },
    object: { params: [{ a: 1 }], expectation: { type: 'object', 'properties': { a: { type: 'number' } } } },
    arrayObject: { params: [[1, 2]], expectation: { type: 'array', items: { type: 'number' } } },
    arrayArray: { params: [[1, { }]], expectation: { type: 'array', items: [{ type: 'number' }, { type: 'object' }] } },
    default: { params: [undefined, true], expectation: { type: 'object', default: { } } },
    string: { params: [''], expectation: { type: 'string' } },
    number: { params: [1], expectation: { type: 'number' } },
    boolean: { params: [true], expectation: { type: 'boolean' } }
  }
  check(generateSchema, tests)
})
