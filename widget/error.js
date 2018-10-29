// functions take "data", "path", "name", "v", "value" and "v params" parameters
export const errorLabels = {
  required: ({name}) => `requis`,
  minLength: ({params}) => `Longueur minimale ${params.min}`,
  maxLength: ({params}) => `Longueur maximale ${params.max}`,
  // requiredIf,
  // requiredUnless,
  minValue: ({params}) => `Plus petit que ${params.min}`,
  minimum: ({params}) => `Plus petit que ${params.min}`,
  maxValue: ({params}) => `Plus grand que ${params.max}`,
  maximum: ({params}) => `Plus grand que ${params.max}`,
  between: ({params}) => `Valeur entre ${params.min} et ${params.max} requise`,
  alpha: 'Lettres requises',
  alphaNum: 'Nombres et lettres requises',
  numeric: 'Nombres requis',
  email: 'email requis',
  ipAddress: 'adresse IP requise',
  macAddress: 'adresse MAC requise',
  // sameAs,
  url: 'URL requise'
  // or,
  // and
}

export const errors = $v => {
  const result = {}
  const {$error, $params, $model} = $v
  if ($error) {
    Object.entries($params).forEach(
      ([name, param]) => {
        if ($v[name]) {
          result[name] = {
            param,
            $model
          }
        }
      }
    )
  }
  return result
}

export const errorsByPath = ($v, path = '/') => {
  const result = {}
  const {$anyError, $error} = $v
  if ($anyError) {
    if ($error) {
      const $verrors = errors($v)
      result[path] = $verrors
    }
    Object.entries($v).forEach(
      ([name, value]) => {
        if (name !== '$model' && name !== '$params' && typeof value === 'object') {
          const deepErrors = errorsByPath(value, `${path}/${name}`)
          Object.assign(result, deepErrors)
        }
      }
    )
  }
  return result
}

export const dirtyByPath = ($v, path = '/') => {
  const result = {}
  const {$anyDirty, $dirty, $model} = $v
  if ($anyDirty) {
    if ($dirty) {
      result[path] = $model
    }
    Object.entries($v).forEach(
      ([name, value]) => {
        if (name !== '$model' && name !== '$params' && typeof value === 'object') {
          const deepDirty = dirtyByPath(value, `${path}/${name}`)
          Object.assign(result, deepDirty)
        }
      }
    )
  }
  return result
}
