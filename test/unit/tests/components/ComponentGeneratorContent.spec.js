import Vue from 'vue'
import CGC from '@/components/ComponentGeneratorContent.vue'

describe('ComponentGeneratorContent.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(CGC)
    const vm = new Constructor().$mount()
    console.log(vm)
    console.log(vm.$el)
    expect(vm.$el.querySelector('.hello h1').textContent)
      .toEqual('Welcome to Your Vue.js App')
  })
})
