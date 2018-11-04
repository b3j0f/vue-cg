<template>
  <!-- container -->
  <component-generator-content
    v-if="finalConf.show && container"
    :conf="container"
    v-bind="containerProps"
    v-on="on"
  >
    <!-- before -->
    <template v-if="finalConf.containers.length === 1">
      <component-generator-content
        v-for="(before, index) in finalConf.before"
        :key="`${id}-before-${index}`"
        :conf="before" v-bind="props" v-on="on"
      />
    </template>
    <!-- container isContained -->
    <component-generator-content :conf="innerConf" v-bind="props" v-on="on" />
    <!-- after -->
    <template v-if="finalConf.containers.length === 1">
      <component-generator-content
        v-for="(after, index) in finalConf.after"
        :key="`${id}-after-${index}`"
        :conf="after" v-bind="props" v-on="on"
      />
    </template>
  </component-generator-content>
  <!-- default conf -->
  <component
    v-else-if="finalConf.show"
    v-show="!finalConf.hide"
    :is="finalConf.is" v-bind="finalConf.props" v-on="finalConf.on"
    v-model="model"
  >
    <!-- inner components -->
    <slot v-if="isContained" />
    <!-- properties -->
    <template v-if="properties">
      <slot name="add">
        <button @click="addProperty()">add</button>
      </slot>
      <slot name="clear">
        <button @click="clear()">clear</button>
      </slot>
      <template v-for="(property, name) in properties">
        <component-generator-content
          :key="`${id}-property-${name}`"
          :conf="property" :path="concatPath(name)"
          v-bind="props" v-on="on"
          @update="updateHandler(name, arguments[0])"
        />
        <slot name="moveBackward">
          <button :key="`${id}-backward-${name}`" @click="moveBackward(name)">backward</button>
        </slot>
        <slot name="moveUpward">
          <button :key="`${id}-upward-${name}`" @click="moveUpward(name)">upward</button>
        </slot>
        <slot name="remove">
          <button :key="`${id}-remove-${name}`" @click="removeProperty(name)">remove</button>
        </slot>
      </template>
      <slot name="post-add">
        <button @click="addProperty()">add</button>
      </slot>
      <slot name="post-clear">
        <button @click="clear()">clear</button>
      </slot>
    </template>
    <!-- items -->
    <template v-if="items">
      <slot name="add">
        <button @click="addItem()">add</button>
      </slot>
      <slot name="clear">
        <button @click="clear()">clear</button>
      </slot>
      <template v-for="(item, index) in items">
        <component-generator-content
          :key="`${id}-item-${index}`"
          :conf="item" :path="concatPath(index.toString())"
          v-bind="props" v-on="on"
          @update="updateHandler(index.toString(), arguments[0])"
        />
        <slot name="moveBackward">
          <button :key="`${id}-backward-${index}`" @click="moveBackward(name)">backward</button>
        </slot>
        <slot name="moveForward">
          <button :key="`${id}-upward-${index}`" @click="moveUpward(name)">forward</button>
        </slot>
        <slot name="remove">
          <button :key="`${id}-remove-${index}`" @click="removeItem(name)">remove</button>
        </slot>
      </template>
      <slot name="post-add">
        <button @click="addItem()">remove</button>
      </slot>
      <slot name="post-clear">
        <button @click="clear()">remove</button>
      </slot>
    </template>
    <!-- html -->
    <div v-if="finalConf.html" v-html="finalConf.html" :slot="finalConf.slot" />
    <!-- text -->
    <div v-if="finalConf.text" v-text="finalConf.text" :slot="finalConf.slot" />
    <!-- children -->
    <component-generator-content
      v-for="(child, index) in finalConf.children"
      :conf="child" :key="`${id}-child-${index}`"
      v-bind="props" v-on="on"
    />
    <!-- slots -->
    <component-generator-content
      v-for="(slot, name) in finalConf.slots"
      :conf="slot" :key="`${id}-slot-${name}`"
      v-bind="props" v-on="on" :slot="name || true"
    />
  </component>
</template>

<script>
/* refers to https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth
 *
 * Generate vue components from a javascript dictionnary.
 */
import { conf, data, path, schema, validation } from '@/mixins'

function guid () {
  function s4 () {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

export default {
  name: 'ComponentGeneratorContent',
  mixins: [conf, data, path, schema, validation],
  props: {
    id: {
      type: String,
      default: () => guid()
    },
    ctx: {
      type: Object,
      default: () => ({})
    },
    isContained: {
      type: Boolean,
      default: false,
      description: 'true if this widget has been generated with a container'
    }
  },
  computed: {
    props () {
      return {
        ctx: this.ctx,
        baseData: this.baseData,
        baseSchema: this.baseSchema,
        path: this.finalPath
      }
    },
    containerProps () {
      return {
        ...this.props,
        isContained: true
      }
    },
    on () {
      return {
        update: value => {
          this.$emit('update', value)
        },
        error: value => {
          this.$emit('error', value)
        }
      }
    }
  },
  methods: {
    updateHandler (key, value) {
      const path = this.concatPath(key)
      this.$emit('update', { value, path })
    }
  }
}
</script>

<style>
</style>
