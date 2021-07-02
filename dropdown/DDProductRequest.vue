<template>
  <div>
    <b-dropdown
      :id="(rowitem!=undefined) ? `DDProductRequest_actionRequest_hover_${rowitem.productId}`:''"
      v-bind="$props"
      no-caret
      lazy
      dropdown
      variant="outline-primary"
      size="sm"
      alt="Show column"
      class="fixed_column_selection widthmax"
    >
      <template #button-content>
        <!-- {{request}}: <br /> -->
        {{ request }}
      </template>
      <b-dropdown-item
        v-for="a in requestoptions"
        :key="a"
        @click="save(rowitem, a)"
      >
        {{ a }}
      </b-dropdown-item>
    </b-dropdown>
    <!-- {{(text == 'mixed')? tooltiptext:''}} -->
    <TooltipTTProductCell
      v-if="(rowitem!==undefined && request == 'mixed')"
      type="actionRequest"
      :target="`DDProductRequest_actionRequest_hover_${rowitem.productId}`"
      :details="allRequests"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { ITableRowItemProducts } from '~/types/ttable'
import { mapValues2Objects } from '~/helpers/hmappings'
const selections = namespace('selections')
@Component
export default class DDProductRequest extends BDropdown {
  @Prop({ }) rowitem!: ITableRowItemProducts|undefined
  @Prop({ default: () => { return ['---'] } }) request!: Array<string>
  @Prop({ default: () => { return ['---', 'none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom'] } }) requestoptions!: Array<string>
  @Prop({ default: () => { return () => {} } }) save!: Function

  @selections.Getter public selectionClients!: Array<string>

  get allRequests () {
    if (this.rowitem === undefined) {
      return {}
    }
    if (this.rowitem.actionRequestDetails) {
      return mapValues2Objects(this.rowitem.actionRequestDetails, this.rowitem.selectedClients as Array<string>, this.selectionClients, 'None')
    }
    return {}
  }
}
</script>

<style>

.widthmax {
  width: 100%;
}
</style>
