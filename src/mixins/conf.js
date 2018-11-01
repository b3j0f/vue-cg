import { getConfs } from '@/lib'
import path from './path'

export default {
  mixins: [path],
  props: {
    conf: {
      type: [Boolean, Object, String, Function],
      default: true
    },
    confs: {
      type: Object
    }
  },
  computed: {
    items () {
      let result = Array.from(this.finalConf.items)
      if (result) {
        if (Array.isArray(result)) {
          result = this.data.map(
            (item, index) => result[Math.min(index, result.length - 1)]
          )
        } else if (typeof result === 'object') {
          result = this.data.map(data => result)
        }
      }
      return result
    },
    properties () {
      let result = Array.from(this.finalConf.properties)

      if (result) {
        if (result === true) {
          result = {}
          Object.entries(this.schema.properties).foreach(
            ([name, property]) => {
              result[name] = this.normalize({
                ...property,
                path: name
              })
            }
          )
        } else if (typeof result === 'object') {
          if (Array.isArray(result)) {
            const _result = {}
            result.forEach(
              name => {
                _result[name] = this.normalize(name, this.getSchema(name))
              }
            )
            result = _result
          } else {
            Object.entries(result).forEach(
              ([name, property]) => {
                result[name] = this.normalize(property, this.getSchema(name))
              }
            )
          }
        } else if (typeof result === 'string') {
          result = this.normalize(result, this.getSchema(result))
        }
      }
      return result
    },
    finalConf () {
      const result = this.normalize(this.conf)
      this.$emit('update:conf', result)
      return result
    },
    innerConf () {
      const result = Object.assign({}, this.finalConf)
      result.containers = result.containers.slice(1)
      delete result.path
      return result
    },
    container () {
      return this.finalConf.containers && this.finalConf.containers[0]
    }
  },
  methods: {
    resolve (elt, dft) {
      if (elt === undefined) {
        elt = dft
      }
      if (typeof elt === 'function') {
        const args = {
          id: this.id,
          conf: this.conf,
          path: this.finalPath,
          data: this.data,
          baseData: this.baseData,
          getData: this.getData,
          schema: this.schema,
          getSchema: this.getSchema,
          getDefaultValue: this.getDefaultValue,
          baseSchema: this.baseSchema,
          scope: this.scope,
          confs: this.confs,
          name: this.name,
          resolvePath: this.resolvePath,
          addItem: this.addItem,
          addProperty: this.addProperty,
          moveItem: this.moveItem,
          moveBackward: this.moveBackward,
          moveForward: this.moveForward,
          removeItem: this.removeItem,
          removeProperty: this.removeProperty,
          clear: this.clear
        }
        elt = elt(args)
      }
      return elt
    },
    getConf (conf, schema, confs) {
      let result = conf
      let { mixins = true } = conf
      const finalConfs = getConfs(confs)
      if (mixins) {
        const id = conf.is || (schema && schema.type) || 'default'
        let baseConf = finalConfs[id]
        if (typeof baseConf === 'function') {
          baseConf = this.resolve(baseConf)
        }
        if (baseConf) {
          if (mixins === true) {
            result = {
              ...result,
              ...baseConf
            }
          } else if (typeof mixins === 'function') {
            result = mixins(baseConf, result)
          } else if (typeof mixins === 'string') {
            result[mixins] = baseConf[mixins]
          } else if (Array.isArray(mixins)) {
            mixins.forEach(
              mixin => {
                result[mixin] = baseConf[mixin]
              }
            )
          } else if (typeof mixins === 'object') {
            Object.entries(mixins).forEach(
              ([name, mixin]) => {
                if (typeof mixin === 'function') {
                  result[name] = mixin(baseConf[name], result[name])
                } else if (name in baseConf) {
                  result[name] = baseConf[name]
                }
              }
            )
          } else {
            throw new Error(`Wrong mixins type : ${mixins}. Boolean, String, Function or Array expected.`)
          }
        }
      }
      return result
    },
    normalize (conf, schema) {
      let result = this.resolve(conf)

      if (schema === undefined) {
        schema = this.schema
      }

      if (typeof result === 'boolean') {
        result = { show: result }
        if (!result.show) {
          return result
        }
      } else if (typeof result === 'string') {
        result = { is: result }
      }

      if (result && typeof result !== 'object') {
        throw new Error(`wrong conf : ${this.conf}. Object or String expected`)
      }

      if (!('is' in result)) {
        result.is = 'div'
      }

      const resolve = name => {
        if (name in result) {
          result[name] = this.resolve(result[name])
        }
      }

      ['show', 'hide', 'text', 'html', 'path', 'properties', 'items', 'props', 'on', 'mixins', 'slots'].forEach(resolve)

      if (!('show' in result)) {
        result.show = true
      }

      result = this.getConf(result, schema, this.confs)

      const asMany = name => {
        const value = result[name]
        if (name in result) {
          if (!Array.isArray(value)) {
            result[name] = [value]
          }
        } else {
          result[name] = []
        }
      }

      ['containers', 'before', 'after', 'children'].forEach(asMany)

      return result
    }
  }
}
