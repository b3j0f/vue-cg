import { getValidations } from '@/lib'
import path from './path'
import conf from './conf'
import { validationMixin } from 'vuelidate'

export default {
  mixins: [path, conf, validationMixin],
  props: {
    validations: {
      type: Object
    }
  },
  computed: {
    errors () {
      let result = this.$v.$anyError
      if (result) {
        result = {}
        const { $params, ...validations } = this.$v.data
        Object.entries(validations).forEach(
          ([name, validation]) => {
            if (validation === false && name in $params) {
              result[name] = $params[name]
            }
          }
        )
        this.$emit('error', { path: this.finalPath, errors: result })
      }
      return result
    }
  },
  validations () {
    return {
      data: {
        ...this.getValidations(),
        ...this.finalConf.validations || {}
      }
    }
  },
  methods: {
    validate () {
      this.$v.data.$touch()
    },
    getValidations (path) {
      const validationsPath = this.concatPath(path)
      return getValidations(this.validations, validationsPath)
    },
    reset () {
      this.$v.$reset()
    }
  }
}
