import { getValue } from '@/lib'
import path from './path'
import schema from './schema'
import conf from './conf'
import validation from './validation'

export default {
  mixins: [path, schema, conf, validation],
  props: ['baseData'],
  computed: {
    data () {
      return this.getData()
    },
    items () {
      let result = this.finalConf.items
      if (result) {
        const data = this.data || []
        if (Array.isArray(result)) {
          result = data.map(
            (item, index) => result[Math.min(index, result.length - 1)]
          )
        } else if (typeof result === 'object') {
          result = data.map(data => result)
        }
      }
      return result
    },
    model: {
      get () {
        let result = this.data
        if (this.finalConf.input) {
          result = this.resolve(this.finalConf.input, result)
        }
        return result
      },
      set (value) {
        if (this.finalConf.output) {
          value = this.resolve(this.finalConf.output, value)
        }
        this.$emit('update', { value, path: this.finalPath })
        this.validate()
      }
    }
  },
  methods: {
    getData (path) {
      const valuePath = this.concatPath(path)
      return getValue(this.baseData, valuePath)
    },
    addItem (index, item) {
      if (index === undefined) {
        index = (this.data && this.data.length) || 0
      }
      const value = item === undefined ? this.getDefaultValue(index.toString()) : item
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
      this.data.splice(newIndex, 0, item)
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
