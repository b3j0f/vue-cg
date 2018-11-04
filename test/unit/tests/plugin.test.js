import { setConfs, getConfs } from '@/lib/conf'
import Plugin from '@/plugin'

describe('install', () => {
  it('default', () => {
    const confs = getConfs()
    class Vue {}
    Plugin.install(Vue)
    expect(Vue.prototype.$sdi).toEqual({ getConfs, setConfs })
    expect(getConfs()).toEqual(confs)
  })

  it('confs', () => {
    class Vue {}
    const confs = getConfs({ test: true })
    Plugin.install(Vue, { confs })
    expect(Vue.prototype.$sdi).toEqual({ getConfs, setConfs })
    expect(getConfs()).toEqual(confs)
  })
})
