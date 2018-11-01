import { getSchema, getDefaultValue } from '@/lib'
import path from './path'

export default {
  mixins: [path],
  props: {
    baseSchema: {
      type: Object,
      required: true
    }
  },
  computed: {
    schema () {
      return this.getSchema()
    }
  },
  methods: {
    getSchema (path) {
      const schemaPath = this.resolvePath(path)
      return getSchema(this.baseSchema, schemaPath)
    },
    getDefaultValue (path) {
      const schemaPath = this.resolvePath(path)
      return getDefaultValue(this.baseSchema, schemaPath)
    }
  }
}
