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
import { ITableRowItemProducts } from '~/types/ttable'
import { mapValues2Value, mapValues2Objects } from '~/helpers/htable'
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
    return mapValues2Value(this.request, this.rowitem.selectedClients as Array<string>, this.selectionClients)
  }

  get allRequests () {
    if (this.rowitem === undefined) {
      return
    }
    return mapValues2Objects(this.request, this.rowitem.selectedClients as Array<string>, this.selectionClients, 'None')
  }
}
</script>

<style>

.widthmax {
  width: 100%;
}
</style>
