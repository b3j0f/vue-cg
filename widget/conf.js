import cloneDeep from 'lodash/cloneDeep'
import Widget from './Widget.vue'

export const getConf = (conf, path = '/') => {
  let result = conf
  const paths = path === '/' ? [''] : path.split('/')
  for (let p of paths.slice(1, paths.length)) {
    const {children = {}} = result
    if (typeof children === 'string') {
      if (p === children) {
        result = p
      }
    } else if (Array.isArray(children)) {
      result = children.find(
        child => {
          if (typeof child === 'string') {
            return child === p
          }
          return child.path === p
        }
      )
      if (result === undefined) {
        break
      }
      continue
    } else if (typeof children === 'object') {
      if (p in children) {
        result = children[p]
        continue
      }
    }
    result = undefined
    break
  }
  return result
}

const components = {
  boolean: ({id, name, path}) => ({
    is: 'input',
    container: true,
    props: {
      type: 'checkbox',
      id: `${id}-${path}`,
      name: `${id}-${path}`
    },
    after: {
      is: 'label',
      props: {
        for: `${id}-${path}`
      },
      text: name
    }
  }),
  string: ({id, name, path, selfSchema, value}) => {
    if (selfSchema.enum) {
      return {
        container: true,
        is: 'select',
        props: {
          id: `${id}-${path}`,
          name: `${id}-${path}`
        },
        inner: selfSchema.enum.map(
          val => ({
            is: 'option',
            props: {
              val: val,
              selected: value === val
            },
            inner: {
              text: val
            }
          })
        ),
        before: {
          is: 'label',
          props: {
            for: `${id}-${path}`
          },
          inner: {
            'text': name
          }
        }
      }
    } else {
      return {
        is: 'input',
        container: true,
        props: {
          type: 'text',
          id: `${id}-${path}`,
          name: `${id}-${path}`
        },
        after: {
          is: 'label',
          props: {
            for: `${id}-${path}`
          },
          text: name
        }
      }
    }
  },
  number: ({id, name, path}) => ({
    is: 'input',
    container: true,
    props: {
      type: 'number',
      id: `${id}-${path}`,
      name: `${id}-${path}`
    },
    after: {
      is: 'label',
      props: {
        for: `${id}-${path}`
      },
      text: name
    }
  }),
  object: ({add, selfSchema, remove, id, scope}) => ({
    container: true,
    is: 'div',
    after: {
      container: true,
      show: () => {
        const {additionalProperties = true, patternProperties = {}} = selfSchema
        return additionalProperties || Object.keys(patternProperties).length > 0
      },
      is: Widget,
      props: {
        schema: {
          type: 'string',
          default: '',
          name: 'property'
        },
        conf: {
          container: true,
          props: {
            id
          },
          before: {
            is: 'label',
            for: id,
            text: 'new property'
          },
          after: {
            is: 'button',
            inner: {
              text: 'add'
            },
            handlers: ({data}) => ({
              click: () => add(undefined, data)
            })
          }
        }
      }
    },
    inner: {
      '*': {
        container: true,
        after: ({name, selfSchema}) => ({
          show: selfSchema.required === undefined || !(name in selfSchema.required),
          is: 'button',
          inner: {
            text: 'remove'
          },
          handlers: {
            click: () => remove(name)
          }
        })
      }
    }
  }),
  array: ({add, remove, moveForward, moveBackward}) => ({
    container: true,
    is: 'div',
    inner: {
      container: true,
      after: ({name}) => [{
        is: 'button',
        inner: {
          text: 'remove'
        },
        handlers: {
          click: () => remove(name)
        }
      }, {
        is: 'button',
        inner: {
          text: 'forward'
        },
        handlers: {
          click: () => moveForward(name)
        }
      }, {
        is: 'button',
        inner: {
          text: 'backward'
        },
        handlers: {
          click: () => moveBackward(name)
        }
      }]
    },
    after: {
      is: 'button',
      inner: {
        text: 'add'
      },
      handlers: {
        click: () => add()
      }
    }
  })
}

export const setComponents = values => {
  Object.assign(components, cloneDeep(values))
}
export const getComponents = values => {
  return Object.assign({}, components, values)
}

/** Normalize a widget configuration related to base components and default properties.
*
* @param conf String|Object|Function : configuration to blend.
* @param components Object : base components if conf ask for inheritance. Default is getComponents result.
* @param schema Object : configuration schema.
* @param widget Object : widget instance for resolving conf functions.
* @param property String :
*/
export const normalize = (conf, components, schema = {}, widget, property) => {
  let result = typeof conf === 'function' ? conf(widget) : cloneDeep(conf)
  if (result === undefined) {
    result = {
      inner: true
    }
  }
  if (typeof result === 'string') {
    result = {
      is: result
    }
  }
  if (result.show === undefined) {
    result.show = true
  }
  if (result.inherits === undefined) {
    result.inherits = true
  }
  if (result.inherits) {
    const type = result.is || (schema && schema.type) || 'object'
    const defaultComponents = components || getComponents()
    if (type in defaultComponents) {
      const defaultComponent = normalize(defaultComponents[type], components, undefined, widget)
      const entries = property ? [[property, defaultComponent[property]]] : Object.entries(defaultComponent)
      entries.forEach(
        ([name, defaultValue]) => {
          if (widget && name !== 'input' && name !== 'output' && typeof defaultValue === 'function') {
            defaultValue = defaultValue(widget)
          }
          let value = result[name]
          if (name !== 'input' && name !== 'output' && typeof value === 'function') {
            value = value(widget)
          }
          if (value === undefined) {
            result[name] = cloneDeep(defaultValue)
          } else {
            if (typeof value === 'object' && (!Array.isArray(value)) && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
              Object.assign(result[name], defaultValue)
            }
          }
        }
      )
    }
  }
  if (widget && !('path' in result)) {
    result.path = widget.path
  }
  return result
}
