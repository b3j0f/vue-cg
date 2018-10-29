import cloneDeep from 'lodash/cloneDeep'
import {getValue} from './data'

export const widget = {
  computed: {
    isTuple () {
      return Array.isArray(this.conf.children)
    },
    type () {
      return this.getConf('type', 'object')
    },
    show () {
      return this.getConf('show', true)
    }
  },
  methods: {
    getValue (path) {
      return getValue(this.baseData, this.value, this.path, path)
    },
    getConf (name, dflt) {
      let result = this.conf[name]
      if (result === undefined) {
        result = dflt
      } else if (typeof result === 'function') {
        result = result(this)
      }
      return cloneDeep(result)
    }
  }
}
