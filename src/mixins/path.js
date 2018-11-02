import { concatPath, absolutePath } from '@/lib'

export default {
  props: {
    path: {
      type: String,
      default: '/'
    }
  },
  computed: {
    name () {
      const path = this.finalPath
      return path.substring(path.lastIndexOf('/') + 1)
    },
    finalPath () {
      let result = absolutePath(this.path)
      if (this.conf) {
        const conf = this.resolve(this.conf)
        if (conf.path) {
          result = concatPath(this.path, conf.path)
        }
      }
      return result
    }
  },
  methods: {
    concatPath (path) {
      return concatPath(this.finalPath, path)
    }
  }
}
