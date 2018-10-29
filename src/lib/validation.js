export const getValidations = (validations, path) => {
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

export const generateValidations = schema => {

}
