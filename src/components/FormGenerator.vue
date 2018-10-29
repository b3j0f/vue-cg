<template>
  <div v-bind="container">
    <component-generator
      :schema="schema"
      :data="localData"
      :confs="confs"
      :conf="conf"
      :ctx="ctx"
      v-on="$listeners"
      @update:data="updateDataHandler"
      @error="errorHandler"
      @dirty="dirtyHandler"
    />
    <div v-bind="actionsContainer">
      <slot name="actions">
        <button :disabled="!dirty && !(error)" @click="submitHandler" />
        <button :disabled="!dirty" @click="clearHandler" />
      </slot>
    </div>
  </div>
</template>

<script>
import ComponentGenerator from './ComponentGenerator.vue'
import {getDefaultValue} from '@/lib'

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
      dirty: false,
      error: false,
      localData: data,
      initialData: data
    }
  },
  methods: {
    dirtyHandler (dirty) {
      this.dirty = dirty
    },
    errorHandler (error) {
      this.error = error
    },
    clearHandler () {
      this.localData = this.initialData
      this.$emit('clear', this.localData)
      this.$emit('update:data', this.localData)
    },
    submitHandler () {
      this.initialData = this.localData
      this.$emit('submit', this.localData)
    },
    updateDataHandler (data) {
      this.localData = data
    }
  }
}
</script>

<style>
</style>
