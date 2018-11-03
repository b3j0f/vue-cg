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
    setValue (key, value) {
      const result = this.data || this.getDefaultValue()
      if (key === undefined) {
        if (Array.isArray(result)) {
          key = result.length
        } else {
          throw new Error(`key is required with a data of type object`)
        }
      }
      if (value === undefined) {
        value = this.getDefaultValue(key)
      }
      result[key] = value
      this.model = result
      return result
    },
    unsetValue (key) {
      const result = this.data || this.getDefaultValue()
      if (Array.isArray(result)) {
        result.splice(key, 1)
      } else {
        delete result[key]
      }
      this.model = result
      return result
    },
    insertItem (index, value) {
      const result = this.data || this.getDefaultValue()
      if (index === undefined) {
        index = result.length
      }
      if (value === undefined) {
        value = this.getDefaultValue(index)
      }
      result.splice(index, 0, value)
      this.model = result
      return result
    },
    moveItem (oldIndex, newIndex) {
      const result = this.data || this.getDefaultValue()
      const [item] = result.splice(oldIndex, 1)
      result.splice(newIndex, 0, item)
      this.model = result
      return result
    },
    moveItemBackward (index) {
      return this.moveItem(index, index - 1)
    },
    moveItemForward (index) {
      return this.moveItem(index, index + 1)
    },
    clear () {
      const result = this.schema.type === 'array' ? [] : {}
      this.model = result
      return result
    }
  }
}
