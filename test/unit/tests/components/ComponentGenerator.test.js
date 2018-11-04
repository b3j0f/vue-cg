import { newComponent } from '../util'
import CG from '@/components/ComponentGenerator.vue'
import Vue from 'vue'

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

describe('validation', () => {
  const states = {
    dirty: undefined,
    errors: undefined,
    update: undefined,
    data: undefined
  }
  let called = false
  const update = val => { states.update = val }
  const errors = val => { states.errors = val; called = val }
  const dirty = val => { states.dirty = val }
  const data = val => { states.data = val }

  const cg = newCG(undefined, { update, errors, dirty, 'update:data': data })

  expect(states).toEqual({ dirty: undefined, errors: undefined, udpate: undefined, data: undefined })

  expect(cg.isDirty).toEqual(false)
  expect(cg.errors).toEqual(false)

  states.dirty = cg.isDirty
  states.errors = cg.errors

  expect(states).toEqual({ dirty: false, errors: false, update: undefined, data: undefined })

  cg.updateHandler({ value: 1, path: 'a' })

  expect(cg.isDirty).toEqual(true)
  expect(cg.errors).toEqual(false)

  expect(states).toEqual({ dirty: true, errors: false, update: { value: 1, path: 'a' }, data: { a: 1 } })

  cg.errorsHandler({ path: 'a', errors: true })

  expect(cg.isDirty).toEqual(true)
  expect(cg.errors).toEqual({ a: true })

  expect(states).toEqual({ dirty: true, errors: { a: true }, update: { value: 1, path: 'a' }, data: { a: 1 } })

  cg.reset()

  expect(states).toEqual({ dirty: false, errors: false, update: { value: 1, path: 'a' }, data: { a: 1 } })

  cg.errorsHandler({ path: 'a/b', errors: true })

  expect(cg.isDirty).toEqual(false)
  expect(cg.errors).toEqual({ 'a/b': true })
  expect(states).toEqual({ dirty: false, errors: { 'a/b': true }, update: { value: 1, path: 'a' }, data: { a: 1 } })

  cg.errorsHandler({ path: 'a', errors: false })

  expect(cg.isDirty).toEqual(false)
  expect(cg.errors).toEqual(false)
  expect(states).toEqual({ dirty: false, errors: false, update: { value: 1, path: 'a' }, data: { a: 1 } })

  cg.updateHandler({ path: '/', value: [] })

  expect(cg.isDirty).toEqual(true)
  expect(cg.errors).toEqual(false)

  expect(states).toEqual({ dirty: true, errors: false, update: { value: [], path: '/' }, data: [] })

  cg.$props.data = 2
})
