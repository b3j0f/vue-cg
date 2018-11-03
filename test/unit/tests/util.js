import Vue from 'vue'

export const check = (fn, tests) => {
  Object.entries(tests).forEach(
    ([key, value]) => {
      const { params = [], expectation, error, input, output } = value
      it(key, () => {
        if ('expectation' in value) {
          if (input) {
            params.splice(0, params.length, input(...params))
          }
          let res = fn(...params)
          if (output) {
            res = output(res, params)
          }
          expect(res).toEqual(expectation)
        } else {
          expect(() => fn(...params)).toThrow(error === true ? Error : error)
        }
      })
    }
  )
}

export const newComponent = Component => (propsData = {}, on = {}) => {
  const Constructor = Vue.extend(Component)

  const result = new Constructor({ propsData }).$mount()
  Object.entries(on).forEach(
    ([key, handler]) => result.$on(key, handler)
  )
  return result
}

export const newComponentFromMixin = mixin => newComponent({ mixins: [mixin], render: () => null })
