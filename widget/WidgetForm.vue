<template>
  <div class="row group">
    <div class="col">
    <widget
      :conf="conf" :$v="$v.data" :value="data"
      @input="input"
      @dirty="dirty"
      :path="conf.name"
      :baseData="data"
      :readonly="readonly"
    />
  </div>
    <slot />
    <div class="row group col-12" v-if="hasActions" slot="actions">
      <q-btn v-if="action !== false || conf.action" v-bind="props('action')" :disable="$v.$error" @click="actionHandler" />
      <q-btn v-if="submit !== false || conf.submit" v-bind="props('submit')" :disable="$v.$error || !isDirty" @click="submitHandler" />
      <q-btn v-if="reset !== false || conf.reset" v-bind="props('reset')" :disable="!isDirty" @click="resetHandler" />
      <q-btn v-if="cancel !== false || conf.cancel" v-bind="props('cancel')" @click="cancelHandler" />
      <q-btn v-if="Array.isArray(actions)" v-for="action in actions" :key="action.name || action.label || action.icon" v-bind="action" @click="actionsHandler(action)" />
    </div>
  </div>
</template>

<script>
import Widget from './Widget.vue'
import cloneDeep from 'lodash/cloneDeep'
import validations from './validation'
import {getConf} from './conf'

const actionProps = {
  action: {label: 'action', color: 'primary'},
  submit: {label: 'confirmer', color: 'primary'},
  cancel: {label: 'annuler', color: 'primary'},
  reset: {label: 'remettre à zéro', color: 'primary'}
}

export default {
  name: 'widget-form',
  data () {
    const defaultValue = this.value
    const data = cloneDeep(defaultValue)
    return {
      defaultValue,
      data,
      dirties: {}
    }
  },
  watch: {
    value (value) {
      this.defaultValue = value
      this.data = cloneDeep(value)
    }
  },
  components: {
    ModeratedInput,
    Widget
  },
  validations () {
    return {
      data: validations(this.conf)
    }
  },
  props: {
    value: {
    },
    actions: {
      type: [Array, Boolean],
      default: () => false
    },
    action: {
      type: [Object, String, Boolean],
      default: false
    },
    submit: {
      type: [Object, String, Boolean],
      default: false
    },
    reset: {
      type: [Object, String, Boolean],
      default: false
    },
    cancel: {
      type: [Object, String, Boolean],
      default: false
    },
    saveAfterSubmit: {
      type: Boolean,
      default: false
    },
    resetAfterSubmit: {
      type: Boolean,
      default: false
    },
    resetAfterCancel: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getSubValue (path) {
      let result = this.data
      const paths = path.split('.')
      for (let p of paths) {
        if (result === undefined) {
          break
        }
        result = result[p]
      }
      return result
    },
    dirty (payload) {
      const {path, value} = payload
      if (path in this.dirties) {
        const dirty = this.dirties[path]
        const old = this.getSubValue(path)
        if (dirty !== old) {
          this.dirties = Object.assign({}, this.dirties, {[path]: value})
        } else {
          delete this.dirties[path]
          this.dirties = Object.assign({}, this.dirties)
        }
      } else {
        this.dirties = Object.assign({}, this.dirties, {[path]: value})
      }
    },
    input (value) {
      this.data = value
      this.$emit('input', value)
    },
    actionHandler () {
      const conf = this.props('action')
      if (conf.handler) {
        conf.handler(this)
      }
      this.$emit('action', this)
    },
    actionsHander (action) {
      const conf = this.props(action)
      if (conf.handler) {
        conf.handler(this)
      }
      this.$emit(action, this)
      this.$emit('actions', {component: this, action})
    },
    submitHandler () {
      const conf = this.props('submit')
      if (conf.handler) {
        conf.handler(this)
      }
      this.$emit('submit', this)
      if (this.saveAfterSubmit !== false) {
        this.defaultValue = cloneDeep(this.data)
      }
      if (this.resetAfterSubmit !== false) {
        this.resetHandler()
      }
    },
    resetHandler () {
      const conf = this.props('reset')
      if (conf.handler) {
        conf.handler(this)
      }
      this.data = cloneDeep(this.defaultValue)
      this.$v.$reset()
      this.dirties = {}
      this.$emit('reset', this)
    },
    cancelHandler () {
      const conf = this.props('cancel')
      if (conf.handler) {
        conf.handler(this)
      }
      if (this.resetAfterCancel !== false) {
        this.resetHandler()
      }
      this.$emit('cancel', this)
    },
    confByName (name) {
      let result = this.conf[name]
      if (typeof result === 'function') {
        result = result(this)
      }
      return result
    },
    props (name) {
      let prop = this[name] || this.confByName(name) || {}
      if (typeof prop === 'string') {
        prop = {label: prop}
      }
      return Object.assign({}, actionProps[name], prop)
    }
  },
  computed: {
    hasActions () {
      const actionNames = ['action', 'submit', 'cancel', 'reset', 'actions']
      let result = false
      for (let action of actionNames) {
        if (this[action] !== false || this.conf[action] === undefined || this.conf[action] !== false) {
          result = true
          break
        }
      }
      return result
    },
    conf () {
      return getConf(this.schema, this.view)
    },
    isDirty () {
      return Object.keys(this.dirties).length
    }
  }
}
</script>

<style>
</style>
