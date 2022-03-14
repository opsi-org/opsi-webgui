<template>
  <div>
    <b-dropdown
      :id="(rowitem!=undefined) ? `DDProductRequest_actionRequest_hover_${rowitem.productId}`:''"
      data-testid="DropdownDDProductRequest"
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
        <span :class="{'value-changed-not-saved' : currentReq != preRequest}">
          {{ visibleRequest }} {{ (currentReq != preRequest)? '*' : '' }}
        </span>
      </template>
      <b-dropdown-item
        v-for="a in options"
        :key="a"
        :data-testid="`DropdownDDProductRequest-Item-${a}`"
        @click="$emit('update:action', a);save(rowitem, a); visibleRequest=a"
      >
        {{ a }}
      </b-dropdown-item>
    </b-dropdown>
    <TooltipTTProductCell
      v-if="(visibleRequest==='mixed')"
      type="actionRequest"
      :target="`DDProductRequest_actionRequest_hover_${rowitem.productId}`"
      :details="allRequests"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Watch } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { ITableRowItemProducts } from '../../.utils/types/ttable'
import { mapValues2Objects } from '../../.utils/utils/smappings'
const selections = namespace('selections')
@Component
export default class DDProductRequest extends BDropdown {
  @Prop({ }) rowitem!: ITableRowItemProducts|undefined
  @Prop({ default: () => { return '---' } }) request!: string
  @Prop({ default: () => { return ['---', 'none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom'] } }) requestoptions!: Array<string>
  @Prop({ default: () => { return () => {} } }) save!: Function

  preRequest: string = this.request
  currentReq: string = this.request
  mounted () {
    this.preRequest = this.visibleRequest
  }

  @Watch('selectionClients', { deep: true })
  selectionClientsChanged () {
    console.log('selected clients changed, so row might change', this.selectionClients, this.rowitem, this.visibleRequest)
    this.$nextTick()
  }

  @selections.Getter public selectionClients!: Array<string>
  get visibleRequest () {
    if (this.rowitem === undefined) {
      this.currentReq = this.request
      return this.currentReq
    }
    if (this.rowitem.selectedClients && this.rowitem.selectedClients.length !== this.selectionClients.length) {
      if (this.request !== 'none') {
        this.currentReq = 'mixed'
      }
    }
    return this.currentReq
  }

  get options () {
    const options = this.requestoptions
    if (this.currentReq === 'mixed') {
      options.push('mixed')
    }
    return options
  }

  set visibleRequest (val: string) {
    this.currentReq = val
  }

  get allRequests () {
    if (this.rowitem === undefined) {
      return {}
    }
    if (this.rowitem.actionRequestDetails) {
      return mapValues2Objects(this.rowitem.actionRequestDetails, this.rowitem.selectedClients as Array<string>, this.selectionClients, 'none')
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
