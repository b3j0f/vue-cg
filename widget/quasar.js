export const field = (conf, cols, props = {}) => {
  const {label = conf.path} = props
  return [{is: 'div', class: cols}, {
    is: 'q-field',
    ...props,
    label
  }]
}
