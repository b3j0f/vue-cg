import Vue from 'vue'

export const check = (fn, tests) => {
  Object.entries(tests).forEach(
    ([key, value]) => {
      const {params = [], expectation, error, func} = value
      it(key, () => {
        if ('expectation' in value) {
          let res = fn(...params)
          if (func) {
            res = func(res)
          }
          expect(res).toEqual(expectation)
        } else {
          expect(() => fn(...params)).toThrow(error)
        }
      })
    }
  )
}

export const getVM = (ref, propsData = {}) => {
  const Component = Vue.extend(ref)
  const vm = new Component({propsData}).$mount()
  return vm
}
