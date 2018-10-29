import cloneDeep from 'lodash/cloneDeep'

/** Modify deeply input source content with input values.
*
* @param source Object : data to modify
* @param values Object : values to set in the source
* @param deep Number 1 : deep level to set values
* @param clone Boolean false : clone values if true
* @return Object assigned values
*
* Example :
* - deep = 0 :
*  + assignDeeply({a: 1, b: 2}, {a: 2, c: 4}) => {a: 2, b: 2, c: 4}
*  + assignDeeply({a: { a: 1, b: 2}, b: 2}, {a: {a: 2, c: 3}, b: 3}) => {a: {a: 2, c: 3}, b: 3}
* - deep = 1 : assignDeeply({a: { a: 1, b: 2}, b: 2}, {a: {a: 2, c: 3}, b: 3}, 1) => {a: {a: 2, b: 2, c: 3}, b: 3}
*/
export const assignDeeply = (source, values, deep = 1, clone = false) => {
  const result = cloneDeep(source)
  _assignDeeply(result, clone ? cloneDeep(values) : values, deep)
  return result
}

export const _assignDeeply = (source, values, deep = 1, clone = false) => {
  if (deep >= 0 && typeof values === 'object') {
    Object.entries(values).forEach(
      ([name, value]) => {
        if (name in source) {
          assignDeeply(source, values[name], deep - 1)
          Object.assign(source, values[name])
        } else {
          source[name] = value
        }
      }
    )
  }
}
