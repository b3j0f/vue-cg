import {absolutePath} from '@/lib/path'

/** Get value relative to input path and data.
*
* @param data Object|Array: data from where get a specific value
* @param path String : path corresponding to the data to retrieve
* @return data value relative to input path
*/
export const getValue = (data, path = '/') => {
  let result = data

  path = absolutePath(path)

  for (let p of path.split('/')) {
    if (p === '.' || p === '') {
      continue
    }
    try {
      result = result[p]
    } catch (ex) {
      result = undefined
    }
  }

  return result
}

/** Set value in the data.
*
* @param data : data to modify
* @param path String : path where set the value in data
* @param value : value to set in data
*/
export const setValue = (data = {}, path, value) => {
  path = absolutePath(path)

  if (path === '/') {
    return value
  }
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
  return data
}
