const defaultConfs = {
  default: {
    is: 'div'
  },
  password: ({ id, path }) => ({
    is: 'input',
    container: true,
    props: {
      type: 'password',
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
  boolean: ({ id, name, path }) => ({
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
  string: ({ id, name, path, schema, value }) => {
    if (schema.enum) {
      return {
        container: true,
        is: 'select',
        props: {
          id: `${id}-${path}`,
          name: `${id}-${path}`
        },
        inner: schema.enum.map(
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
  number: ({ id, name, path }) => ({
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
  object: ({ add, schema, remove, id, scope }) => ({
    container: true,
    is: 'div',
    after: {
      container: true,
      show: () => {
        const { additionalProperties = true, patternProperties = {} } = schema
        return additionalProperties || Object.keys(patternProperties).length > 0
      },
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
            handlers: ({ data }) => ({
              click: () => add(undefined, data)
            })
          }
        }
      }
    },
    inner: {
      '*': {
        container: true,
        after: ({ name, schema }) => ({
          show: schema.required === undefined || !(name in schema.required),
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
  array: ({ add, remove, moveForward, moveBackward }) => ({
    container: true,
    is: 'div',
    inner: {
      container: true,
      after: ({ name }) => [{
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

export const setConfs = values => {
  return Object.assign(defaultConfs, values)
}
export const getConfs = values => {
  return Object.assign({}, defaultConfs, values)
}
