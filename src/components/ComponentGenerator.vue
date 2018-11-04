<template>
  <component-generator-content
    :baseSchema="finalSchema"
    :baseData="finalData"
    :confs="confs"
    :conf="conf"
    :ctx="ctx"
    :validations="validations"
    @update="updateHandler"
    @error="errorHandler"
    ref="cgc"
  />
</template>

<script>
/* refers to https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth
 *
 * Generate vue components from a javascript dictionnary.
 */
import ComponentGeneratorContent from './ComponentGeneratorContent.vue'
import {setValue, getDefaultValue, generateSchema, generateValidations} from '@/lib'

export default {
  components: {
    ComponentGeneratorContent
  },
  model: {
    prop: 'data',
    event: 'update:data'
  },
  props: {
    conf: {
      type: [Boolean, Object, String, Function],
      default: true
    },
    ctx: {
      type: Object,
      default: () => ({})
    },
    data: {
      type: [Object, Boolean, String, Number, Function],
      default: undefined
    },
    schema: {
      type: Object
    },
    confs: {
      type: Object
    }
  },
  data () {
    return {
      localData: this.data,
      errors: {},
      dirty: false
    }
  },
  computed: {
    validations () {
      return generateValidations(this.finalSchema)
    },
    finalSchema () {
      let result = this.schema
      if (result === undefined) {
        if (this.localData === undefined) {
          result = generateSchema()
        } else {
          result = generateSchema(this.localData)
        }
      }
      this.$emit('update:schema', result)
      return result
    },
    finalData () {
      let result = this.localData
      if (result === undefined) {
        result = getDefaultValue(this.schema)
      }
      this.$emit('update:data', result)
      return result
    },
    isDirty () {
      const result = this.dirty
      this.$emit('dirty', result)
      return result
    },
    hasErrors () {
      const result = Object.keys(this.errors).length === 0 ? false : this.errors
      this.$emit('errors', result)
      return result
    }
  },
  methods: {
    reset () {
      this.dirty = false
      this.errors = {}
      this.$refs.cgc.reset()
    },
    updateHandler (arg) {
      this.$emit('update', arg)
      this.dirty = true
      const { value, path } = arg
      this.localData = setValue(this.finalData, path, value)
    },
    errorHandler ({path, errors}) {
      // clean deeper paths
      Object.keys(this.errors).forEach(
        key => {
          if (key.startsWith(path)) {
            delete this.errors[key]
          }
        }
      )
      // update this.errors with new entries
      if (errors) {
        this.errors[path] = errors
      } else {
        delete this.errors[path]
      }
    }
  }
}
</script>

<style>
</style>
