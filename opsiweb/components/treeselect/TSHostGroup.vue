<template>
  <div>
    <treeselect v-model="value" :multiple="true" :options="options" :max-height="200" />
    group: {{ value }}
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSHostGroup extends Vue {
  value: Array<string> = []
  options: any
  fetch () {
    this.options = [{
      id: 'a',
      label: 'a',
      children: [{
        id: 'aa',
        label: 'aa'
      }, {
        id: 'ab',
        label: 'ab'
      }]
    }, {
      id: 'b',
      label: 'b'
    }, {
      id: 'c',
      label: 'c'
    }]
  }
}
</script>

<style>

</style>
