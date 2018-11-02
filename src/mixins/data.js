import { getValue } from '@/lib'
import path from './path'
import schema from './schema'

export default {
  mixins: [path, schema],
  props: {
    baseData: {
      required: true
    }
  },
  computed: {
    data () {
      return this.getData()
    },
    items () {
      let result = Array.from(this.finalConf.items)
      if (result) {
        if (Array.isArray(result)) {
          result = this.data.map(
            (item, index) => result[Math.min(index, result.length - 1)]
          )
        } else if (typeof result === 'object') {
          result = this.data.map(data => result)
        }
      }
      return result
    }
  },
  methods: {
    getData (path) {
      const valuePath = this.resolvePath(path)
      return getValue(this.baseData, valuePath)
    },
    addItem (index) {
      if (index === undefined) {
        index = (this.data && this.data.length) || 0
      }
      const value = this.getDefaultValue(index.toString())
      this.data.splice(index, 0, value)
      this.model = this.data
    },
    addProperty (name) {
      const value = this.getDefaultValue(name)
      this.data[name] = value
      this.model = this.data
    },
    removeItem (index) {
      this.data.splice(index, 1)
      this.model = this.data
    },
    removeProperty (name) {
      delete this.data[name]
      this.model = this.data
    },
    moveItem (oldIndex, newIndex) {
      const [item] = this.data.splice(oldIndex, 1)
      this.data.splice(newIndex - newIndex >= oldIndex ? 1 : 0, 0, item)
      this.model = this.data
    },
    moveBackward (index) {
      this.moveItem(index, index - 1)
    },
    moveUpward (index) {
      this.moveItem(index, index + 1)
    },
    clear () {
      const value = this.data.constructor()
      this.model = value
    }
  }
}
