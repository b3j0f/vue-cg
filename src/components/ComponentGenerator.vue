<template>
  <component-generator-content
    :baseSchema="finalSchema"
    :baseData="finalData"
    :confs="confs"
    :conf="conf"
    :ctx="ctx"
    @update="updateHandler"
    @error="errorHandler"
  />
</template>

<script>
/* refers to https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth
 *
 * Generate vue components from a javascript dictionnary.
 */
import ComponentGeneratorContent from './ComponentGeneratorContent.vue'
import {setValue, getDefaultValue, generateSchema} from '@/lib'

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
      localData: undefined
    }
  },
  computed: {
    finalSchema () {
      let result = this.schema
      if (result === undefined) {
        if (this.data === undefined && this.localData === undefined) {
          result = generateSchema()
        } else if (this.data === undefined) {
          result = generateSchema(this.localData)
        } else {
          result = generateSchema(this.data)
        }
      }
      this.$emit('update:schema', result)
      return result
    },
    finalData () {
      let result = this.localData === undefined ? this.data : this.localData
      if (result === undefined) {
        result = getDefaultValue(this.schema)
      }
      this.$emit('update:data', result)
      return result
    },
    isDirty () {
      const result = this.$v.$anyDirty
      this.$emit('dirty', result)
      return result
    },
    hasErrors () {
      const result = this.$v.$anyError || Object.keys(this.errors).length
      this.$emit('error', result)
      return result
    }
  },
  methods: {
    updateHandler (arg) {
      this.$emit('update', arg)
      const {value, path} = arg
      this.localData = setValue(this.finalData, path, value)
    },
    errorHandler ({path, errors}) {
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
