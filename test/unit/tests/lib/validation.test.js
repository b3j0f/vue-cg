import { check } from '../util'
import { getValidations, generateValidations } from '@/lib/validation'

import { required as _required } from 'vuelidate/lib/validators'

const formats = [
  'alpha',
  'alphaNum',
  'numeric',
  'email',
  'ipAddress',
  'macAddress',
  'url',
  'ipv4',
  'ipv6'
]

describe('getValidations', () => {
  const validations = {
    a: {
      b: {
        $each: {
          c: { }
        }
      }
    }
  }
  const tests = {
    default: { expectation: { } },
    undefined: { params: [validations], expectation: validations },
    root: { params: [validations, '/'], expectation: validations },
    simple: { params: [validations, 'a'], expectation: validations.a },
    $each: { params: [validations, 'a/b/c'], expectation: validations.a.b.$each },
    deep$each: { params: [validations, 'a/b/d/c'], expectation: validations.a.b.$each.c },
    none: { params: [validations, '/c'], expectation: undefined }
  }
  check(getValidations, tests)
})

describe('generateValidations', () => {
  const multipleOf = val => {
    val.multipleOf(1)
    return Object.keys(val)
  }
  const tests = {
    default: { expectation: { } },
    validation: { output: Object.keys, params: [{ validation: () => true }], expectation: ['validation'] },
    number: { output: multipleOf, params: [{ type: 'number', multipleOf: 1, minimum: 1, exclusiveMinimum: true, exclusiveMaximum: true, maximum: 3 }], expectation: ['multipleOf', 'minimum', 'maximum'] },
    array: { output: Object.keys, params: [{ type: 'array', items: [{ type: 'object' }], minItems: 1, maxItems: 3 }], expectation: ['minItems', 'maxItems', '$each'] },
    boolean: { params: [{ type: 'boolean' }], expectation: { } },
    object: { params: [{ type: 'object', properties: { a: { } }, required: ['a'] }], expectation: { a: { required: _required } } }
  }
  formats.forEach(
    format => {
      tests[`string-${format}`] = { output: Object.keys, params: [{ type: 'string', format, minLength: 2, maxLength: 4, pattern: '^a.*' }], expectation: [format, 'minLength', 'maxLength', 'pattern'] }
    }
  )
  check(generateValidations, tests)
})
