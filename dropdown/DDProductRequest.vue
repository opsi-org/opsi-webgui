<template>
  <div>
    <b-dropdown
      v-bind="$props"
      no-caret
      lazy
      dropleft
      variant="outline-primary"
      size="sm"
      alt="Show column"
      class="fixed_column_selection widthmax"
    >
      <template #button-content>
        <!-- {{request}}: <br /> -->
        {{ visibleRequest }}
      </template>
      <b-dropdown-item
        v-for="a in requestoptions"
        :key="a"
        @click="save(rowitem, a)"
      >
        {{a}}
      </b-dropdown-item>
    </b-dropdown>
    {{(visibleRequest==="mixed")? allRequests:''}}
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { IObjectString2String, ITableRowItemProducts } from '~/types/tsettings'
const selections = namespace('selections')
@Component
export default class DDProductRequest extends BDropdown {
  @Prop({ }) rowitem!: ITableRowItemProducts|undefined
  @Prop({ default: () => { return ['---'] } }) request!: Array<string>
  @Prop({ default: () => { return ['---', 'none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom'] } }) requestoptions!: Array<string>
  @Prop({ default: () => { return () => {} } }) save!: Function

  @selections.Getter public selectionClients!: Array<string>
  get visibleRequest () {
    if (this.rowitem === undefined) {
      return '---'
    }
    if (!this.request || !this.request[0]) {
      return 'none'
    }
    if (this.rowitem.selectedClients === undefined || this.rowitem.selectedClients === null) {
      return 'none'
    }
    if (this.rowitem.selectedClients.length === 0) {
      return 'none'
    }
    if (this.selectionClients.length === 1 && this.request.length === 1) {
      return this.request[0]
    }
    if (this.selectionClients.length > 1 && this.request.length === 1) {
      return (this.request[0] === 'none') ? 'none' : 'mixed'
    }
    if (this.selectionClients.length === this.rowitem.selectedClients.length) {
      if (this.request.every(val => val === this.request[0])) {
        return this.request[0]
      }
    }
    if (this.request.every(val => val === 'none')) {
      return 'none'
    }

    return 'mixed'
  }

  get allRequests () {
    if (this.rowitem === undefined) {
      return
    }
    if (!this.request || !this.request[0]) {
      return
    }
    if (this.rowitem.selectedClients === undefined) {
      return
    }
    const client2request: IObjectString2String = {}
    for (const i in this.rowitem.selectedClients) {
      client2request[this.rowitem.selectedClients[i]] = this.request[i]
    }
    return client2request
  }
}
</script>

<style>

.widthmax {
  width: 100%;
}
</style>
