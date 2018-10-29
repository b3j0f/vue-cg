import {getValidations} from '@/lib'
import path from './path'
import conf from './conf'

export default {
  mixins: [path, conf],
  props: {
    validations: {
      type: Object
    }
  },
  computed: {
    errors () {
      let result = false
      const {$params, ...validations} = this.$v
      Object.entries(validations).forEach(
        ([name, validation]) => {
          if (validation === false) {
            if (result === false) {
              result = {}
            }
            result[name] = $params[name]
          }
        }
      )
      return result
    }
  },
  validations () {
    let result = this.getValidations()
    if (this.finalConf.validations) {
      const confValidations = this.resolve(this.finalConf.validations)
      Object.assign(result, confValidations)
    }
    return result
  },
  methods: {
    validate () {
      this.$v.$touch()
      this.$emit('error', {path: this.finalPath, errors: this.errors})
    },
    getValidations (path) {
      const finalPath = this.finalPath
      return getValidations(this.validations, finalPath)
    }
  }
}
