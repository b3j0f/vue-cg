import {getVM} from '../util'
import CGC from '@/components/ComponentGeneratorContent.vue'

describe('ComponentGeneratorContent.vue', () => {
  it('default', () => {
    const instance = getVM(CGC, {baseSchema: {}})
    expect(instance).toEqual({})
  })
})
