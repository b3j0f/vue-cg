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
