import { getConfs } from '@/lib'
import path from './path'
import schema from './schema'

export default {
  mixins: [schema, path],
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
    properties () {
      let result = this.finalConf.properties

      if (result) {
        if (result === true) {
          result = {}
          Object.entries(this.schema.properties || {}).forEach(
            ([name, property]) => {
              result[name] = this.normalize({}, property)
            }
          )
        } else if (typeof result === 'object') {
          if (Array.isArray(result)) {
            const _result = {}
            result.forEach(
              name => {
                const schema = this.getSchema(name)
                _result[name] = this.normalize(name, schema)
              }
            )
            result = _result
          } else {
            Object.entries(result).forEach(
              ([name, property]) => {
                const schema = this.getSchema(name)
                result[name] = this.normalize(property, schema)
              }
            )
          }
        } else if (typeof result === 'string') {
          const schema = this.getSchema(result)
          result = this.normalize(result, schema)
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
      if (result.containers) {
        result.containers = result.containers.slice(1)
        if (result.containers.length === 0) {
          delete result.before
          delete result.after
          delete result.containers
        }
      }
      return result
    },
    container () {
      return this.finalConf.containers && this.finalConf.containers[0]
    }
  },
  methods: {
    /** Resolve an element in calling with some parameters if element is a function
    * @param elt : element to resolve
    * @param dft : default value to use if elt is undefined
    * @param pub Boolean : private to this mixin. Used for resolving finalPath
    */
    resolve (elt, dft, pub = true) {
      if (elt === undefined) {
        elt = dft
      }
      if (typeof elt === 'function') {
        const args = {
          id: this.id,
          conf: this.conf,
          path: this.path,
          data: this.data,
          baseData: this.baseData,
          getData: this.getData,
          getSchema: this.getSchema,
          getDefaultValue: this.getDefaultValue,
          baseSchema: this.baseSchema,
          scope: this.scope,
          confs: this.confs,
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
        if (pub) {
          Object.assign(args, {
            finalPath: this.finalPath,
            name: this.name,
            schema: this.schema
          })
        }
        elt = elt(args)
      }
      return elt
    },
    /** Normalize input configuration with additional initialization parameters.
    * @param conf Object|String|Boolean|Function : configuration to convert to an Object.
    * @param schema Object : schema used to normalize input configuration (with schema.type for example). Default is this.schema.
    * @param confs Object : default configurations to use with the function getConfs. By default, this.confs.
    * @return Object
    */
    getConf (conf, schema, confs) {
      let result = conf
      const { mixins = true } = conf
      if (mixins) {
        const finalConfs = getConfs(confs)
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
                } else if (mixin && name in baseConf) {
                  result[name] = baseConf[name]
                }
              }
            )
          } else {
            throw new Error(`Wrong mixins type : ${mixins}. Boolean, String, Function or Array expected.`)
          }
        }
        delete result.mixins
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
        }
      }

      ['containers', 'before', 'after', 'children'].forEach(asMany)

      return result
    }
  }
}
