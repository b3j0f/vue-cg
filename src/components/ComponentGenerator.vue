<template>
  <component-generator-content
    :baseSchema="finalSchema"
    :baseData="finalData"
    :confs="confs"
    :conf="conf"
    :ctx="ctx"
    :validations="validations"
    @update="updateHandler"
    @errors="errorsHandler"
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
import Vue from 'vue'

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
      localErrors: {},
      dirty: false,
      localSchema: this.schema
    }
  },
  mounted () {
    this.$nextTick()
    const dirty = this.isDirty
    const errors = this.hasErrors
  },
  computed: {
    validations () {
      return generateValidations(this.finalSchema)
    },
    finalSchema () {
      let result = this.localSchema
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
        result = getDefaultValue(this.localSchema)
      }
      this.$emit('update:data', result)
      return result
    },
    isDirty () {
      const result = this.dirty
      return result
    },
    errors () {
      const result = Object.keys(this.localErrors).length === 0 ? false : this.localErrors
      return result
    }
  },
  watch: {
    data: {
      handler (val) {
        this.localData = val
      },
      deep: true
    }
  },
  methods: {
    reset () {
      this.dirty = false
      this.$emit('dirty', this.isDirty)
      Object.keys(this.localErrors).forEach(
        key => this.$delete(this.localErrors, key)
      )
      this.$emit('errors', this.errors)
      this.$refs.cgc.reset()
    },
    updateHandler (arg) {
      this.$emit('update', arg)
      this.dirty = true
      this.$emit('dirty', this.isDirty)
      const { value, path = '/' } = arg
      const newValue = setValue(this.finalData, path, value)
      if (typeof newValue === 'object') {
        if (Array.isArray(newValue)) {
          this.localData = Object.assign([], newValue)
        } else {
          this.localData = Object.assign({}, newValue)
        }
      }
      this.$emit('update:data', this.finalData)
    },
    errorsHandler ({path, errors}) {
      // clean deeper paths
      Object.keys(this.localErrors).forEach(
        key => {
          if (key.startsWith(path)) {
            this.$delete(this.localErrors, key)
          }
        }
      )
      // update this.localErrors with new entries
      if (errors) {
        this.$set(this.localErrors, path, errors)
      } else {
        this.$delete(this.localErrors, path)
      }
      this.$emit('errors', this.errors)
    }
  }
}
</script>

<style>
</style>
