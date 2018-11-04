import { newComponent } from '../util'
import CG from '@/components/ComponentGenerator.vue'

const newCG = (props, on) => newComponent(CG)(props, on)

describe('data', () => {
  it('default', () => {
    const cg = newCG()
    expect(cg.finalData).toEqual({})
  })
  it('schema', () => {
    const cg = newCG({ schema: { type: 'number' } })
    expect(cg.finalData).toEqual(0)
  })
})

describe('schema', () => {
  it('default', () => {
    const cg = newCG()
    expect(cg.finalSchema).toEqual({ type: 'object' })
  })
  it('data', () => {
    const cg = newCG({ data: 0 })
    expect(cg.finalSchema).toEqual({ type: 'number' })
  })
})
