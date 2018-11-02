import { newComponent } from '../util'
import CGC from '@/components/ComponentGeneratorContent.vue'

describe('ComponentGeneratorContent.vue', () => {
  newComponent(CGC)
  it('true', () => expect(true).toEqual(true))
})
