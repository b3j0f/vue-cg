<template>
  <div v-if="show && component.html" v-html="getConf('html')" />
  <div v-else-if="show && component.text" v-text="getConf('text')" />
  <component
    v-else-if="show && container"
    :is="container.is"
    v-bind="container.props"
    v-on="container.handlers"
  >
    <template v-if="containers.length === 1">
      <widget
        v-for="(beforeConf, index) in before"
        :key="`before-${index}`"
        v-bind="widgetProps"
        v-on="widgetHandlers"
        :conf="beforeConf"
        node="before"
      />
    </template>
    <widget
      v-bind="widgetProps"
      v-on="widgetHandlers"
      :conf="contentConf"
      node="content"
    />
    <template v-if="containers.length === 1">
      <widget
        v-for="(afterConf, index) in after"
        :key="`after-${index}`"
        v-bind="widgetProps"
        v-on="widgetHandlers"
        :conf="afterConf"
        node="after"
      />
    </template>
  </component>
  <component
    v-else-if="show && component.is"
    :is="component.is"
    v-bind="props"
    v-on="handlers"
  >
    <widget
      v-for="(inner, index) in inner"
      :key="`inner-${index}`"
      v-bind="widgetProps"
      v-on="widgetHandlers"
      :conf="inner"
      node="inner"
    />
    <widget
      v-for="(slot, index) in slot"
      :key="`slot-${index}`"
      :slot="slot.name"
      v-bind="widgetProps"
      v-on="widgetHandlers"
      :conf="slot"
      node="slot"
    />
  </component>
  <widget
    v-else-if="show && composite"
    v-bind="widgetProps"
    v-on="widgetHandlers"
    :conf="composite"
    node="composite"
  >
    <div v-for="(item, index) in items" :key="index">
      <widget
        v-bind="widgetProps"
        v-on="widgetHandlers"
        :conf="item"
        node="item"
      />
      <widget
        v-if="content.actions"
        v-bind="widgetProps"
        v-on="widgetHandlers"
        :conf="content.actions"
        node="actions"
      />
    </div>
    <widget
      v-if="composite.add"
      v-bind="widgetProps"
      v-on="widgetHandlers"
      :conf="composite.add"
      node="add"
    />
  </widget>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import {getSchema, getDefaultValue, generateSchema} from './schema'
import {getPath} from './path'
import {getComponents, normalize} from './conf'
import {setValue, getValue} from './data'
import {updater} from 'lib/mixins'
import validations from './validation'
import {v4} from 'uuid'
import {errors, errorsByPath, dirtyByPath} from './error'

const props = {
  data: {
  },
  validation: {
    type: Object
  },
  schema: {
    type: Object
  },
  conf: {
    type: [Object, String, Function],
    default: () => ({
      inner: true,
      path: '/'
    })
  }
}

export default {
  name: 'widget',
  model: {
    prop: 'data',
    event: 'update:data'
  },
  mixins: [updater(props)],
  props: {
    id: {
      type: String,
      default: () => v4()
    },
    readonly: {
      type: [Function, Boolean],
      default: false
    },
    components: {
      type: Object,
      default: getComponents
    },
    node: {
      type: String,
      default: 'root'
    },
    scope: {
      type: Object,
      default: () => ({})
    }
  },
  validations () {
    const result = {
      value: validations(this.selfSchema)
    }
    const validation = this.getConf('validation')
    if (validation) {
      result.value.validation = validation
    }
    return result
  },
  data () {
    let ddata = this.data
    let dschema = this.schema
    if (ddata === undefined) {
      if (dschema === undefined) {
        throw new Error('Schema and data are undefined. At least one must be given')
      } else {
        ddata = getDefaultValue(dschema)
      }
    } else if (dschema === undefined) {
      dschema = generateSchema(ddata)
    }
    return {
      dschema,
      ddata
    }
  },
  computed: {
    component () {
      const result = this.initComponent(this.conf)
      return result
    },
    slot () {
      return this.initComponents('slot')
    },
    widgetProps () {
      return {
        schema: this.cschema,
        data: this.cdata,
        scope: this.cscope
      }
    },
    widgetHandlers () {
      return {
        dirty: this.dirtyHandler,
        error: this.errorHandler,
        'update:data': this.updateData
      }
    },
    path () {
      return (this.conf && this.conf.path) || '/'
    },
    container () {
      return this.containers[0]
    },
    containers () {
      let result = this.getConf('container', [])
      if (result === true) {
        result = 'div'
      }
      if (!Array.isArray(result)) {
        result = [result]
      }
      result = result.map(this.initComponent)
      return result
    },
    inner () {
      const {type = 'object'} = this.selfSchema
      let result = this.getConf('inner')
      result = this.process(result)
      if (result) {
        if (type === 'object') {
          if (result === true) {
            const {properties = {}, additionalProperties = true, patternProperties = {}} = this.selfSchema
            let keys = Object.keys(properties)
            result = Array.from(keys)
            if (this.value) {
              Object.keys(this.value || {}).forEach(
                name => {
                  if (keys.indexOf(name) === -1) {
                    const patternProperty = Object.keys(patternProperties).find(
                      pattern => name.match(new RegExp(pattern))
                    )
                    if (patternProperty || additionalProperties) {
                      result.push(name)
                    }
                  }
                }
              )
            }
          }
          if (!Array.isArray(result)) {
            result = [result]
          }
          result = result.map(
            item => typeof item === 'string' ? ({
              path: this.getPath(item)
            }) : item
          )
        } else if (type === 'array') {
          const items = this.value
          const {additionalItems} = this.selfSchema
          result = items.map(
            (item, index) => {
              const path = this.getPath(index)
              if (typeof result === 'string') {
                return {
                  is: item,
                  path
                }
              } else if (Array.isArray(result)) {
                if (index in result) {
                  const component = this.initComponent(result[index])
                  return {
                    ...component,
                    path
                  }
                } else if (additionalItems) {
                  return {
                    ...additionalItems,
                    path
                  }
                }
              } else if (typeof result === 'object') {
                return {
                  ...result,
                  path
                }
              }
            }
          )
        } else {
          result = this.initComponents('inner')
        }
      }
      return result
    },
    selfSchema () {
      const result = getSchema(this.cschema, this.path)
      return result
    },
    type () {
      return this.selfSchema.type || 'object'
    },
    contentConf () {
      const result = cloneDeep(this.component)
      result.container = this.process(result.container)
      if (Array.isArray(result.container)) {
        result.container.splice(0, 1)
      } else {
        result.container = []
      }
      return result
    },
    before () {
      return this.initComponents('before')
    },
    after () {
      return this.initComponents('after')
    },
    value () {
      return getValue(this.cdata, this.path)
    },
    /** Properties to sync
    * @return Object
    */
    sync () {
      let result = this.getConf('sync', [])
      result = this.process(result)
      if (!Array.isArray(result)) {
        result = [result]
      }
      const handler = (name, handler) => val => {
        if (handler) {
          handler(val, name, this)
        }
        this.updateValue(val, name)
      }
      result = result.map(
        item => {
          if (typeof item === 'string') {
            return {
              name: item,
              prop: item,
              handler: handler(item)
            }
          } else if (typeof item === 'object') {
            return {
              name: item.name,
              prop: item.name || item.prop,
              handler: handler(item.name, item.handler)
            }
          }
        }
      )
      return result
    },
    /** Get conf properties to bind to the component attribute v-bind.sync
    *
    * @return Object
    */
    props () {
      const result = this.getConf('props', {})
      this.sync.forEach(
        ({prop, name}) => {
          result[prop] = this.value[name]
        }
      )
      if (this.component.is === 'input') { // quick hack for handling input modification
        const name = ['checkbox', 'radio'].indexOf(result.type) === -1 ? 'value' : 'checked'
        if (!(name in result)) {
          result[name] = this.model
        }
      }
      const {prop} = this.model
      if (!(prop in result)) {
        result[prop] = this.propModel()
      }
      return result
    },
    /** Get conf model property
    *
    * @return Object
    */
    model () {
      let result = this.getConf('model', {prop: 'value', event: 'input'})
      if (typeof result === 'string') {
        result = {prop: result, event: 'input'}
      } else if (Array.isArray(result)) {
        result = {prop: result[0], event: result[1]}
      } else if (typeof result === 'object') {
        result.prop = result.prop || 'value'
        result.event = result.event || 'input'
      }
      if (typeof result !== 'object') {
        throw new Error(`Wrong model type: ${result}(${typeof result})`)
      }
      return result
    },
    /** Get conf handlers to bind to the component attribute v-on
    *
    * @return Object
    */
    handlers () {
      const result = this.getConf('handlers', {})
      this.sync.forEach(
        ({prop, handler}) => {
          result[`update:${prop}`] = handler
        }
      )
      if (this.component.is === 'input') { // quick hack for handling input modification
        const input = handler => event => {
          this.updateValue(event.srcElement.value)
          return handler ? handler(event) : true
        }
        result.input = input(result.input)
      }
      const {event} = this.model
      if (!(event in result)) {
        result[event] = val => {
          if (val && val.srcElement) {
            if (val.target !== val.currentTarget) {
              return
            }
          }
          this.updateValue((val && val.srcElement) ? val.srcElement.value : val)
        }
      }
      return result
    },
    /** Get conf/schema name.
    *
    * Name corresponds to last path entry, or schema name if last pash entry does not exist.
    *
    * @return conf/schema name
    */
    name () {
      const paths = this.path.split('/')
      let result = paths[paths.length - 1]
      if (!result) {
        result = paths[paths.length - 2]
        if (!result && this.selfSchema.name) {
          result = this.selfSchema.name
        }
      }
      return result
    },
    show () {
      return this.getConf('show')
    },
    /** Is local value in error ?
    */
    error () {
      return this.$v.$error
    },
    /** Get local error params and $model
    */
    errors () {
      return errors(this.$v)
    },
    /** Is local value dirty ?
    */
    dirty () {
      return this.$v.$dirty
    },
    /** Get scoped error params and $model by path
    */
    errorsByPath () {
      return errorsByPath(this.$v, this.path)
    },
    /** Get dirty value by path
    */
    dirtyByPath () {
      return dirtyByPath(this.$v, this.path)
    }
  },
  methods: {
    updateData (val) {
      this.cdata = val
    },
    propModel () {
      let result = this.value
      if (result === undefined) {
        result = this.defaultValue()
        if (this.component.input) {
          const process = this.process(this.component.input, result)
          if (process !== undefined) {
            result = process
          }
        }
        if (result !== undefined) {
          this.updateValue(result)
        }
      } else if (this.component.input) {
        const process = this.process(this.component.input, result)
        if (process !== undefined) {
          result = process
        }
      }
      return result
    },
    updateValue (value, path) {
      const valuePath = this.getPath(path)
      if (value === undefined) {
        value = this.value
      }
      if (path === undefined && this.component.output) {
        const result = this.process(this.component.output, value)
        if (result !== undefined) {
          value = result
        }
      }
      const ordered = this.getConf('ordered')
      if (value && (this.type === 'array' || Array.isArray(value) || ordered)) {
        const orderedName = typeof ordered === 'string' ? ordered : 'order'
        value = value.map((item, index) => item ? ({...item, [orderedName]: index}) : item)
      }
      const oldData = cloneDeep(this.cdata)
      const oldValue = getValue(oldData, valuePath)
      if (valuePath !== '/') {
        setValue(this.cdata, valuePath, value)
      } else {
        this.cdata = value
      }
      this.$emit('dirty', {
        oldValue, oldData, data: this.cdata, value, path: valuePath
      })
      this.$v.$touch()
      if (this.error) {
        this.$emit('error', {
          errors: this.errors,
          oldValue,
          oldData,
          data: this.cdata,
          value,
          path: valuePath
        })
      }
    },
    /** Add a value in current `value` content (object and array types).
    *
    * @param value : value to add. If undefined, it will be automatically generated from schema description.
    */
    add (value, key) {
      switch (this.type) {
        case 'object':
          this.value[key] = value
          break
        case 'array':
          if (key) {
            this.value.splice(key, 0, value)
          } else {
            this.value.push(value)
          }
          break
        default: throw new Error(`Unhandled type ${this.type}. Object or array expected.`)
      }
      this.updateValue()
    },
    /**
    */
    remove (key) {
      switch (this.type) {
        case 'object':
          delete this.value[key]
          break
        case 'array':
          this.value.splice(key, 1)
          break
        default: throw new Error(`Unhandled type ${this.type}. Object or array expected.`)
      }
      this.updateValue()
    },
    move (from, to) {
      const itemFrom = this.value[from]
      this.value[from] = this.value[to]
      this.value[to] = itemFrom
      this.updateValue()
    },
    moveForward (key) {
      const [item] = this.value.splice(key, 1)
      const pos = Math.min(Number(key) + 1, this.value.length)
      this.updateValue([...this.value.slice(0, pos), item, ...this.value.slice(pos)])
    },
    moveBackward (key) {
      const [item] = this.value.splice(key, 1)
      const pos = Math.max(Number(key) - 1, 0)
      this.updateValue([...this.value.slice(0, pos), item, ...this.value.slice(pos)])
    },
    dirtyHandler (params) {
      this.$emit('dirty', params)
      this.$emit('update:data', this.cdata)
    },
    errorHandler (params) {
      this.$emit('errors', params)
    },
    defaultData () {
      let result
      if (typeof this.conf === 'object' && 'default' in this.conf && (!('path' in this.conf) || this.conf.path === '/')) {
        result = this.conf.default
        result = this.process(result)
      } else {
        result = getDefaultValue(this.cschema)
      }
      return result
    },
    defaultValue () {
      let result
      if (typeof this.conf === 'object' && 'default' in this.conf && 'path' in this.conf && this.conf.path !== '/') {
        result = this.conf.default
        result = this.process(result)
      } else {
        result = getDefaultValue(this.selfSchema)
      }
      return result
    },
    getConf (name, dflt) {
      let result = this.component[name]
      if (result === undefined) {
        result = dflt
      } else {
        result = this.process(result)
      }
      return cloneDeep(result)
    },
    initComponent (component) {
      return normalize(component, this.components, this.selfSchema, this)
    },
    initComponents (name) {
      let result = this.getConf(name, [])
      if (!Array.isArray(result)) {
        result = [result]
      }
      result = result.map(this.initComponent)
      return result
    },
    process (func, ...params) {
      let result = func
      if (typeof func === 'function') {
        const scope = this
        /* ['show', 'path', 'component', 'container', 'container', 'actions', 'children', 'validation', 'ordered', 'value', 'data', 'schema', 'selfSchema', 'conf', 'type', 'childViews', 'getData'].forEach(
          name => {
            arguments[name] = this[name]
          }
        ) */
        result = func(scope, ...params)
      }
      return result
    },
    getValue (path) {
      return getValue(this.cdata, path)
    },
    getPath (path) {
      return getPath(path, this.path)
    }
  }
}
</script>

<style>
</style>
