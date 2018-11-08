# vue-cg (vue component generator)

[![npm version](https://img.shields.io/npm/v/vue-cg.svg?maxAge=2592000)](https://www.npmjs.com/package/vue-cg)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)
[![Apache2 License](https://img.shields.io/badge/license-Apache 2-blue.svg)](https://git.link-society.com/link-society/vue-cg/src/master/LICENSE)
[![Build Status](https://travis-ci.com/b3j0f/vue-cg.svg?branch=master)](https://travis-ci.com/b3j0f/vue-cg)

> Vue component generator using a (dynamic) configuration, a (generated) json schema and a (generated) data-binding

This library is inspired from *schema-form-generator library*-like with a json-schema, data-binding and specific configuration view. In a generic approach, I wonted to go far away and apply such principles to any vue components and data visualization (network, multi data displaying, data array, etc.).

Next step will be to generate an entire site with this dynamic configuration which is easier/faster to read and lighter to html-like and vue functions rendering.

## Live Demo

Coming soon...

## Features

* generate vue components from a (dynamic) DSL rendering configuration
* component data-binding
* generate schema based on data
* generate data from a schema
* no dependencies but vue2

## Installation

### npm or yarn

```bash
yarn add vue-cg

npm i -S vue-cg
```

## Examples

[cf examples](https://git.link-society.com/link-society/vue-cg/src/master/examples)

### Typical use with a simple clickable html button:
template:
``` html
<component-generator :conf="{is: 'button', text: 'click-me', on: {click: alert('clicked !')}}" ></component-generator>
```

.vue file:
``` js
  ...
  import {ComponentGenerator} from 'vue-cg'
  export default {
    components: {
      ComponentGenerator
    }
  ...
```

### Dynamic configuration, data-binding and schema generation for login:

template:
```html
<component-generator :conf="conf" :schema.sync="schema" v-model="form"></component-generator>
```

.vue file:
``` js
  ...
  import {ComponentGenerator} from 'vue-cg'

  export default {
    components: {
      ComponentGenerator
    },
    data () {
      return {
        form: { // login fields
          username: '',
          password: ''
        }
      }
    },
    computed: {
      conf () {
        return ({data}) => ({ // dynamic configuration function
          is: 'button', // type of component to generate. https://vuejs.org/v2/guide/components.html#Dynamic-Components
          props: { // component properties
            style: 'color: blue' // blue color style
          },
          containers: ['card', 'card-main'], // encapsulate the button inside component configuration(s) 'card' then 'card-item' (card and card-main doesn't exist by default. See the function setConfs or the plugin for specifying your default configurations)
          text: 'login', // shortcut for vue property `v-text/innerText`
          on: { // component handlers
            click: this.login // login the user
          },
          before: { // add before the button and inside containers login fields
            properties: { // shortcut for children with specific paths
              username: true, // according to generated schema, use default configuration for string data (<input />)
              password: 'password' // default password configuration (<input type="password" />)
            }
          }
        })
      }
    },
    methods: {
      login () {
        // do something with this.form
      }
    }
  ...
```

## Description of features

This lib aims to provide a component generator able to generate components related to a DSL rendering configuration with data-binding and json schema consistency.

### Component generator

```js
import {ComponentGenerator} from 'vue-cg'
```

#### Properties

- id : String : default is generated from uuid v4 or from conf.id
- data : used as v-model. Default is generated from the schema. If not schema, default is empty object
- conf : Object|String|Boolean|Function : component configuration. See the section [Configuration](#Configuration) for more details
- schema : Object : json schema v3 to v7. By default, generated from 'data'. If no data is given, schema is {type: 'object'}
- ctx : Object : used to add specific properties at component runtime

#### Events

- input (data) : fired after data modification/generation
- update ({path, value, data}) : fired after data modification, with given value path
- update:schema (schema) : fired once the schema is generated

### Configuration

#### Static

Types: Object|Boolean|String

* Object : contains following properties
  - is*: String|Object ('default'): component name/object to use. See https://vuejs.org/v2/guide/components.html#Dynamic-Components for more details
  - show* : Boolean (true) : shortcut to the directive v-if
  - hide* : Boolean (false) : shortcut to the directive v-show="!hide"
  - containers/children/before/after : Array[Configuration]|Configuration : configure components to generate respectively around/inside/before/after.
  - input : Function(data, props) : called each time a data is bound to v-model. The result is the final bound data.
  - output : Function(data, props) : called each time a bound data is updated from v-model. The result is the final bound result.
  - properties/items* : Boolean|Function
  - text/html* : String|Function :
* Boolean : shortcut to {is: schema.type, show: value}
* String : shortcut to {is: value}

#### Dynamic

All properties designated with a star '*' can be given such as a function. In such case, they behavior like vue computed getters, and the parameter is an object filled with current Component properties :

##### Properties

* path: String ('/'): concatenation of component path and configuration path
* name: String : path value after the last slash '/'
* baseSchema: Object ({type: 'object'}) : schema generator.
* schema: Object ({type: 'object'}) : component schema
* baseData: data generator
* data: component generator
* id: universal unique component id
* conf: component configuration
* ctx: context property object
* confs: set of default configurations

##### Methods
* getPath (path = '.'): get a path from current component
* getSchema (path = '.'): get a schema from current component schema
* getData (path = '.'): get data value from current component data
* getDefaultValue (path = '.'): get schema data from current component schema
* getValidations (path = '.'): get data validations from current component validations
* validate (data = getData()): validate input data
* concatPath (path): concat input path to current component path
* setValue (key, value=getDefaultValue()): set value at input key. If key is undefined and data is an array, value is array.length. Throw an error in case of an object.
* insertItem (index, value): data array specific. insert value at input index, in moving forward next values.
* moveItem (old, new): data array specific. move input old item index to new item index
* moveItemBackward (index): data array specific. move input keyed item backward in the array
* moveItemForward (index): data array specific. move input keyed item forward in the array
* unsetValue (key): remove keyed property/item from current component data
* clear: reset current component data (empty object/array).

## Contribute

Sources : https://git.link-society.com/link-society/vue-cg.git

``` bash
# install dependencies
npm install

yarn

# run lint
npm run lint

# run tests
npm run test
```

## Perspectives
