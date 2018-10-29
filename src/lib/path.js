/** Transform input path into an absolute path without relative accesses ('.', '..')
* @param String path : path to convert to an absolute path.
*
* Example:
* absolute paths
* - / -> /
* - /a -> /a
* - /a/. -> /a
* - /a/.. -> /
* relative paths
* - -> /
* - a -> /a
* - a/. -> /a
* - a/.. -> /
*/
export const absolutePath = (path = '/') => {
  const paths = []
  path.split('/').forEach(
    p => {
      switch (p) {
        case '':
        case '.':
          break
        case '..':
          paths.splice(paths.length - 1, 1)
          break
        default:
          paths.push(p)
      }
    }
  )
  return `/${paths.join('/')}`
}

/** Transform input newPath to an absolute path, relative to input absPath, or absolutely from a root.
* Such paths are like unix system file pathing.
*
* @param source : source path.
* @param path : new path relative to absPath or absolute to the root path.
* @return absolute path of newPath.
*
* Example :
* absolute paths
* - (/first/second) => /first/second
* - (first/second) => /first/second
* - (./) => /
* - (./.) => /
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
export const concatPath = (source = '/', path) => {
  if (path === undefined) {
    return absolutePath(source)
  }
  if (path[0] === '/') {
    return absolutePath(path)
  }
  return absolutePath(`${absolutePath(source)}/${path}`)
}
