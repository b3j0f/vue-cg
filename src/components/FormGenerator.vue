<template>
  <div v-bind="container">
    <component-generator
      v-model="model"
      :schema="schema"
      :data="localData"
      :confs="confs"
      :conf="conf"
      :ctx="ctx"
      v-on="$listeners"
      ref="cg"
    />
    <slot name="actions">
      <div v-bind="actionsContainer">
        <button :disabled="!dirty && !(error)" @click="submitHandler" />
        <button :disabled="!dirty" @click="resetHandler" />
      </div>
    </slot>
  </div>
</template>

<script>
import ComponentGenerator from './ComponentGenerator.vue'
import { getDefaultValue } from '@/lib'

export default {
  components: {
    ComponentGenerator
  },
  model: {
    prop: 'data',
    event: 'update:data'
  },
  props: {
    container: {
      type: Object
    },
    actionsContainer: {
      type: Object
    },
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
    const data = this.data || getDefaultValue(this.schema)
    return {
      localData: data,
      initialData: data
    }
  },
  computed: {
    model: {
      get () {
        return this.localData
      },
      set (val) {
        this.localData = val
        this.$emit('update:data', val)
      }
    },
    isDirty () {
      return this.$refs.cg.isDirty
    },
    errors () {
      return this.$refs.cg.errors
    }
  },
  methods: {
    reset () {
      this.$refs.cg.reset()
      this.localData = this.initialData
      this.$emit('reset', this.localData)
      this.$emit('update:data', this.localData)
    },
    resetHandler () {
      this.reset()
    },
    submitHandler () {
      this.initialData = this.localData
      this.$emit('submit', this.localData)
    }
  }
}
</script>

<style>
</style>
