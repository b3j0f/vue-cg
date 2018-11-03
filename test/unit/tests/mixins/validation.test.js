import { check, newComponentFromMixin } from '../util'
import mixin from '@/mixins/validation'
import { required } from 'vuelidate/lib/validators'

const mixedComponent = newComponentFromMixin(mixin)

describe('validations', () => {
  const func = props => mixedComponent(props).$v.data
  let validated = true
  const conf = { validations: { b: () => validated } }
  const validations = { a: () => validated }

  const tests = {
    default: { expectation: { $anyDirty: false, $anyError: false, $dirty: false, $error: false, $invalid: false, $model: undefined, $params: {}, $pending: false } },
    validations: { params: [{ validations }], expectation: { $anyDirty: false, $anyError: false, $dirty: false, $error: false, $invalid: false, $model: undefined, $params: { a: null }, $pending: false, a: true } },
    conf: { params: [{ validations, conf }], expectation: { $anyDirty: false, $anyError: false, $dirty: false, $error: false, $invalid: false, $model: undefined, $params: { a: null, b: null }, $pending: false, a: true, b: true } }
  }

  check(func, tests)
})

describe('errors', () => {
  const func = props => mixedComponent(props).errors
  let validated = true
  const conf = { validations: { b: () => validated } }
  const validations = { a: () => validated, required }

  const tests = {
    default: { expectation: false },
    validations: { params: [{ validations }], expectation: false },
    conf: { params: [{ validations, conf }], expectation: false }
  }

  check(func, tests)

  validated = false
  const errorFunc = props => {
    const cmpt = mixedComponent(props)
    expect(cmpt.$v.$anyError).toEqual(false)
    cmpt.validate()
    expect(cmpt.$v.$anyError).toEqual(true)
    return cmpt.errors
  }

  const errors = {
    validations: { params: [{ validations }], expectation: { a: null, required: { type: 'required' } } },
    conf: { params: [{ validations, conf }], expectation: { a: null, b: null, required: { type: 'required' } } }
  }

  check(errorFunc, errors)
})

describe('getValidations', () => {
  const validations = { a: { $each: { c: () => true } } }
  const func = path => mixedComponent({ validations }).getValidations(path)

  const tests = {
    default: { expectation: validations },
    root: { params: ['/'], expectation: validations },
    deep: { params: ['a/b/c'], expectation: validations.a.$each.c },
    unknown: { params: ['unknown'], expectation: undefined }
  }

  check(func, tests)
})
