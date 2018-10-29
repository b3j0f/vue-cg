import {getComponents, setComponents} from './conf'

export default {
  install (Vue, {components}) {
    Vue.getComponents = getComponents
    Vue.setComponenstByTypes = setComponents
    setComponents(components)
  }
}
