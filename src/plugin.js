import { getConfs, setConfs } from '@/lib/conf'

export default {
  install (Vue, { confs } = {}) {
    Vue.prototype.$sdi = { getConfs, setConfs }
    setConfs(confs)
  }
}
