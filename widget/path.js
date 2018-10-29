/** Transform input newPath to an absolute path, relative to input absPath, or absolutely from a root.
* Such paths are like unix system file pathing.
*
* @param path : new path relative to absPath or absolute to the root path.
* @param absPath : an absolute path.
* @return absolute path of newPath.
*
* Example :
* absolute paths
* - (/first/second) => /first/second
* - (first/second) => /first/second
* - (./) => /
* - (./first/second) => /first/second
* - (first/./second) => /first/second
* - (../first/second) => /first/second
* - (first/../second) => /second
* relative paths
* - (first/second, /third) => /third/first/second
* - (../first/second, /third) => /first/second
* - (/first/second, /third) => /first.second
* - (first/../second, /third) => /third/second
*/
export const getPath = (path, absPath = '/') => {
  if (absPath[0] !== '/') {
    throw new Error(`Absolute path ${absPath} must starts by '/'`)
  }
  if (path === undefined) {
    return absPath
  }
  const resultPaths = absPath.split('/').filter(item => item)
  // is path an absolute path ?
  if (path[0] === '/') {
    resultPaths.length = 0
    path = path.substring(1)
  }
  const paths = path.split('/').filter(item => item !== '.' && item !== '')
  paths.forEach(
    p => {
      if (p === '..') {
        resultPaths.splice(resultPaths.length - 1)
      } else {
        resultPaths.push(p)
      }
    }
  )
  const stream = resultPaths.join('/')
  const result = `/${stream}`
  return result
}
