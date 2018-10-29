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
            if (result.length < minItems && additionalItems) {
              result = [
                ...result,
                Array(minItems - result.length).fill(
                  () => getDefaultValue(additionalItems)
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
  const paths = path.split('/').filter(item => item)
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
        for (let pattern in patternProperties) {
          if (p.match(new RegExp(pattern))) {
            result = patternProperties[pattern]
            continue
          }
        }
      }
      const {additionalProperties = true} = result
      if (additionalProperties !== false) {
        result = additionalProperties === true ? {} : additionalProperties
        continue
      }
    } else if (type === 'array') {
      const index = Number(p)
      if (!isNaN(index)) {
        const {items = {}, additionalItems = true} = result
        if (Array.isArray(items)) {
          if (index < items.length) {
            result = items[index]
            continue
          } else if (additionalItems) {
            if (additionalItems === true) {
              result = {}
            } else {
              result = additionalItems
            }
            continue
          }
        } else {
          result = items
          continue
        }
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
export const generateSchema = (data = {}) => {
  const result = {
    type: Array.isArray(data) ? 'array' : ((data === null || data === undefined) ? 'object' : typeof data)
  }
  if (result.type === 'object') {
    result.properties = {}
    Object.entries(data).forEach(
      ([name, value]) => {
        result.properties[name] = generateSchema(value)
      }
    )
  } else if (result.type === 'array') {
    result.items = {}
    data.forEach(
      item => {
        Object.assign(result.items, generateSchema(item))
      }
    )
  }
  return result
}
