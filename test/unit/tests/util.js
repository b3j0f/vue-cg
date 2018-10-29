export const check = (fn, values) => {
  Object.entries(values).forEach(
    ([key, value]) => {
      const {params = [], expectation, error} = value
      it(key, () => {
        if ('expectation' in value) {
          expect(fn(...params)).toEqual(expectation)
        } else {
          expect(() => fn(...params)).toThrow(error)
        }
      })
    }
  )
}
