<template>
  <div>
    <b-dropdown
      :id="(rowitem!=undefined) ? `DDProductRequest_actionRequest_hover_${rowitem.productId}`:''"
      data-testid="DropdownDDProductRequest"
      v-bind="$props"
      no-caret
      lazy
      dropdown
      :disabled="config?.read_only"
      variant="outline-primary"
      size="sm"
      alt="Show column"
      class="DDProdRequest fixed_column_selection widthmax"
      :class="rowIsSelected? 'selected' : ''"
    >
      <template #button-content>
        <span :class="{'value-changed-not-saved' : currentReq != preRequest}">
          {{ visibleRequest }} {{ (currentReq != preRequest)? t_fixed('notOrigin') : '' }}
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
      v-if="(visibleRequest==='mixed') && rowitem"
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
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { mapValues2Objects } from '../../.utils/utils/smappings'
import { Strings } from '../../mixins/strings'
const selections = namespace('selections')
const config = namespace('config-app')

@Component({ mixins: [Strings] })
export default class DDProductRequest extends BDropdown {
  t_fixed: any
  @Prop({ }) rowitem!: ITableRowItemProducts|undefined
  @Prop({ }) rowIsSelected: boolean|undefined
  @Prop({ default: () => { return '---' } }) request!: string
  @Prop({ default: () => { return ['none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom'] } }) requestoptions!: Array<string>
  @Prop({ default: () => { return () => { return {} } } }) save!: Function

  preRequest: string = this.request
  currentReq: string = this.request

  @config.Getter public config!: IObjectString2Boolean
  @selections.Getter public selectionClients!: Array<string>

  updated () {
    this.preRequest = this.visibleRequest
  }

  @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
    this.currentReq = this.request
    this.preRequest = this.request
    return this.currentReq
  }

  get visibleRequest () {
    this.currentReq = this.request
    if (this.rowitem === undefined) {
      return this.currentReq
    }
    if (this.rowitem.selectedClients && this.rowitem.selectedClients.length !== this.selectionClients.length) {
      if (this.request !== 'none') {
        this.currentReq = 'mixed'
      }
    }
    return this.currentReq
  }

  set visibleRequest (val: string) {
    this.currentReq = val
  }

  get options () {
    const options = this.requestoptions
    if (this.currentReq === 'mixed' && !options.includes('mixed')) {
      options.push('mixed')
    }
    return options
  }

  get allRequests () {
    if (this.rowitem === undefined) {
      return {}
    }
    if (this.rowitem.actionRequestDetails || this.selectionClients.length > 1) {
      return mapValues2Objects(this.rowitem.actionRequestDetails ?? [this.rowitem.actionRequest], this.rowitem.selectedClients, this.selectionClients, 'none')
    }
    return {}
  }
}
</script>

<style>
.widthmax {
  width: 100%;
}
.DDProdRequest .dropdown-menu .dropdown-item {
  font-weight: normal !important;
}
</style>
