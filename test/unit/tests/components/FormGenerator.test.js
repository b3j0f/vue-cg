import { newComponent } from '../util'
import FG from '@/components/FormGenerator.vue'

const newFG = (props, on) => newComponent(FG)(props, on)

describe('model', () => {
  const processFG = (fg, data) => {
    const random = Math.random()
    expect(fg.isDirty).toEqual(false)
    expect(fg.errors).toEqual(false)
    fg.model = random
    fg.resetHandler()
    expect(fg.model).toEqual(data)
    expect(fg.isDirty).toEqual(false)
    expect(fg.errors).toEqual(false)
    fg.model = random
    fg.submitHandler()
    expect(fg.model).toEqual(random)
    expect(fg.isDirty).toEqual(false)
    expect(fg.errors).toEqual(false)
    fg.resetHandler()
    expect(fg.model).toEqual(random)
    expect(fg.isDirty).toEqual(false)
    expect(fg.errors).toEqual(false)
  }
  it('default', () => {
    const fg = newFG()
    expect(fg.model).toEqual({})
    processFG(fg, {})
  })
  it('schema', () => {
    const fg = newFG({ schema: { type: 'number' } })
    expect(fg.model).toEqual(0)
    processFG(fg, 0)
  })
  it('data', () => {
    const fg = newFG({ data: 2 })
    expect(fg.model).toEqual(2)
    processFG(fg, 2)
  })
})
