import {
  required as _required,
  minLength as _minLength,
  maxLength as _maxLength,
  // requiredIf,
  // requiredUnless,
  minValue,
  maxValue,
  // between,
  alpha,
  alphaNum,
  numeric,
  email,
  ipAddress,
  macAddress,
  // sameAs,
  url
  // or,
  // and
} from 'vuelidate/lib/validators'

const formats = {
  alpha,
  alphaNum,
  numeric,
  email,
  ipAddress,
  macAddress,
  url,
  ipv4: ipAddress,
  ipv6: ipAddress
}

const _multipleOf = val => value => {
  return Math.round(value / val) === value / val
}

export const generateValidations = (schema = {}) => {
  const result = {}
  const {
    minLength, maxLength, pattern, format,
    multipleOf, minimum, exclusiveMinimum, maximum, exclusiveMaximum,
    minItems, maxItems,
    validation,
    type = 'object',
    items = {},
    required,
    properties = {}, patternProperties = {}, additionalProperties = {}
  } = schema

  if (validation) { // custom validation
    result.validation = validation
  }
  if (type === 'string') {
    if (format in formats) {
      result[format] = formats[format]
    }
    if (minLength !== undefined) {
      result.minLength = _minLength(minLength)
    }
    if (maxLength !== undefined) {
      result.maxLength = _maxLength(maxLength)
    }
    if (pattern) {
      result.pattern = value => value.match(new RegExp(pattern))
    }
  }
  if (type === 'number') {
    if (multipleOf) {
      result.multipleOf = _multipleOf(multipleOf)
    }
    if (minimum) {
      result.minimum = minValue(minimum + (exclusiveMinimum ? 1 : 0))
    }
    if (maximum) {
      result.maximum = maxValue(maximum + (exclusiveMaximum ? 1 : 0))
    }
  }
  if (type === 'array') {
    if (minItems) {
      result.minItems = _minLength(minItems)
    }
    if (maxItems) {
      result.maxItems = _maxLength(maxItems)
    }
    if (items) {
      let toValidate = Array.isArray(items) ? {} : items
      if (Array.isArray(items)) {
        items.forEach(
          item => {
            toValidate[item.name] = item
          }
        )
      }
      const $each = generateValidations(toValidate)
      result.$each = $each
    }
  }
  if (type === 'boolean') {

  }
  if (type === 'object') {
    Object.entries(properties).forEach(
      ([name, property]) => {
        result[name] = generateValidations(property)
        if (required && required.indexOf(name) !== -1) {
          result[name].required = _required
        }
      }
    )
    additionalProperties.toString()
    patternProperties.toString()
  }

  return result
}

export const getValidations = (validations, path = '/') => {
  let result = validations
  const paths = path.split('/').filter(p => p)
  for (let p of paths) {
    if (p in result) {
      result = result[p]
    } else if ('$each' in result) {
      result = result.$each
    } else {
      result = undefined
      break
    }
  }
  return result
}
