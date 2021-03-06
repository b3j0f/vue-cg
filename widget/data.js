/** Get value relative to input path and data.
*
* @param data Object|Array: data from where get a specific value
* @param path String : path corresponding to the data to retrieve
* @return data value relative to input path
*/
export const getValue = (data, path = '/') => {
  let result = data
  const paths = path.split('/').filter(item => item)
  for (let p of paths) {
    if (result === undefined || result === null) {
      break
    }
    result = result[p]
  }
  return result
}

/** Set value in the data.
*
* @param data : data to modify
* @param path String : path where set the value in data
* @param value : value to set in data
*/
export const setValue = (data, path, value) => {
  const paths = path.split('/').filter(item => item)
  let tmp = data
  for (let index = 0; index < paths.length; index++) {
    if (tmp === undefined || tmp === null) {
      break
    }
    const p = paths[index]
    if (index === (paths.length - 1)) {
      tmp[p] = value
    } else if (p in tmp) {
      tmp = tmp[p]
    } else {
      break
    }
  }
}
