import { getSchema, getDefaultValue } from '@/lib'
import path from './path'

export default {
  mixins: [path],
  props: {
    baseSchema: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    schema () {
      return this.getSchema()
    }
  },
  methods: {
    getSchema (path) {
      const schemaPath = this.concatPath(path)
      return getSchema(this.baseSchema, schemaPath)
    },
    getDefaultValue (path) {
      const schema = this.getSchema(path)
      return getDefaultValue(schema)
    }
  }
}
