import {absolutePath} from './path'

export const getDefaultValue = (schema = {}) => {
  let result
  if ('default' in schema) {
    result = typeof schema.default === 'object' ? Object.assign(schema.default.constructor(), schema.default) : schema.default
  } else {
    const {type} = schema
    switch (type) {
      case 'number':
        result = 0
        break
      case 'boolean':
        result = false
        break
      case 'string':
        result = ''
        break
      case 'object':
      case 'array':
      default:
        if (type === 'array') {
          const {minItems = 0, items, additionalItems = true} = schema
          result = []
          if (Array.isArray(items)) {
            result = items.map(getDefaultValue)
            if ((result.length < minItems) && additionalItems) {
              result = [
                ...result,
                ...Array(minItems - result.length).fill().map(
                  () => getDefaultValue(additionalItems === true ? {} : additionalItems)
                )
              ]
            }
          } else {
            result = Array(minItems).fill().map(() => getDefaultValue(items))
          }
        } else {
          result = {}
          if ('properties' in schema) {
            Object.entries(schema.properties).forEach(
              ([name, subSchema]) => {
                result[name] = getDefaultValue(subSchema)
              }
            )
          }
        }
    }
  }
  return result
}

/** Get a schema part from an absolute path resulting of the getPath function.
*
* @param schema : input schema to parse.
* @param path : absolute path respecting the file system pathing.
* @return specific part of schema or undefined if path does not match schema sub part.
*/
export const getSchema = (schema = {}, path = '/') => {
  let result = schema
  path = absolutePath(path)
  const paths = path.split('/').filter(p => p)
  for (let p of paths) {
    const {type = 'object'} = result
    if (type === 'object') {
      if ('properties' in result) {
        if (p in result.properties) {
          result = result.properties[p]
          continue
        }
      }
      const {patternProperties} = result
      if (patternProperties) {
        let found = false
        for (let pattern in patternProperties) {
          if (p.match(pattern)) {
            found = true
            result = patternProperties[pattern]
            break
          }
        }
        if (found) {
          break
        }
      }
      const {additionalProperties = true} = result
      if (additionalProperties !== false) {
        result = additionalProperties === true ? {} : additionalProperties
        continue
      }
    } else if (type === 'array') {
      const {items, additionalItems = true} = result
      if (Array.isArray(items)) {
        if (p in items) {
          result = items[p]
          continue
        }
      } else if (items) {
        result = items
        continue
      } else if (additionalItems) {
        result = additionalItems === true ? {} : additionalItems
        continue
      }
    }
    result = undefined
    break
  }
  return result
}

/** Generate a jsonschema from a data.
*
* By default, schema is of type object, and arrays are set of object items.
*/
export const generateSchema = (data = {}, dft = false) => {
  const result = {
    type: Array.isArray(data) ? 'array' : ((data === null || data === undefined) ? 'object' : typeof data)
  }
  if (dft) {
    result.default = data
  }
  if (result.type === 'object') {
    Object.entries(data).forEach(
      ([name, value]) => {
        if (result.properties === undefined) {
          result.properties = {}
        }
        result.properties[name] = generateSchema(value, dft)
      }
    )
  } else if (result.type === 'array') {
    result.items = {}
    if (data.length) {
      const type = typeof data[0]
      for (let i = 1; i < data.length; i++) {
        const itype = typeof data[i]
        if (itype !== type) {
          result.items = []
          break
        }
      }
    }
    if (Array.isArray(result.items)) {
      result.items = data.map(d => generateSchema(d, dft))
    } else {
      result.items = generateSchema(data[0], dft)
    }
  }
  return result
}
