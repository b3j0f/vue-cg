import { newComponent } from '../util'
import CGC from '@/components/ComponentGeneratorContent.vue'

const newCGC = (props, on) => newComponent(CGC)(props, on)

describe('id', () => {
  it('unique', () => {
    const n = 1000
    const ids = {}
    for (let i = 0; i < n; i++) {
      ids[newCGC().id] = true
    }
    expect(Object.keys(ids).length).toEqual(n)
  })
})

describe('ctx', () => {
  it('default', () => expect(newCGC().ctx).toEqual({}))
  it('setted', () => expect(newCGC({ ctx: { 1: 1 } }).ctx).toEqual({ 1: 1 }))
})

describe('computed', () => {
  const props = { ctx: { 1: 1 }, baseData: 1, baseSchema: { type: 'number' }, path: '/a' }

  it('props', () => {
    expect(newCGC(props).props).toEqual(props)
  })
  it('containerProps', () => {
    expect(newCGC(props).containerProps).toEqual({ ...props, isContained: true })
  })
  it('on', () => {
    expect(Object.keys(newCGC().on)).toEqual(['update', 'error'])
    let updated = false
    let errored = false
    const update = val => { updated = val }
    const error = val => { errored = val }
    const cgc = newCGC(undefined, { update, error })
    cgc.on.update(true)
    cgc.on.error(true)
    expect(updated && errored).toEqual(true)
  })
})

describe('methods', () => {
  it('updateHandler', () => {
    const path = 'a'
    const update = ({ value, path }) => {
      expect(value).toEqual(true)
      expect(path).toEqual('/a/b')
    }
    const cgc = newCGC({ path }, { update })
    cgc.updateHandler('b', true)
  })
})
