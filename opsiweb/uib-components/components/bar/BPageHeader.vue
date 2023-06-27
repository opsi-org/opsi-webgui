<template>
  <div>
    <b-navbar data-testid="BarBPageHeader" variant="transparent" class="p-1">
      <div v-b-toggle="'collapse' + tableid" :class="navbartype == 'collapse' ? 'btn col-10 text-left border-0 pl-0' : 'text-small'">
        <b-icon v-if="navbartype == 'collapse'" :icon="expanded ? icon.arrowDoubleDown : icon.arrowDoubleRight" />
        <span v-if="title" class="font-weight-bold tableheader_title">{{ title }}</span>
        <span v-if="subtitle" class="font-italic ml-1"> {{ subtitle }} </span>
      </div>
      <b-navbar-nav class="flex-wrap">
        <slot name="left" />
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <slot name="right" />
        <b-button v-if="closeroute" size="sm" class="border-0" variant="outline-primary" :to="closeroute">
          <span class="sr-only">{{ $t('button.close') }}</span> <b-icon :icon="icon.x" />
        </b-button>
      </b-navbar-nav>
    </b-navbar>
    <b-collapse v-if="tableid" :id="'collapse' + tableid" v-model="expanded" :visible="expanded">
      <b-navbar class="flex-wrap p-0">
        <template v-if="tableid">
          <TreeTSDepots v-if="tableid !== 'Depots'" />
          <TreeTSHostGroups v-if="tableid !== 'Depots'" />
          <TreeTSProductGroups v-if="tableid == 'products'" />
        </template>

        <b-navbar-nav v-if="!treeview" :class="(childopened || closeroute) && $mq == 'desktop' ? '': 'ml-auto mb-1'">
          <InputIFilter :data="tableInfo" />
          <DropdownDDTableSorting :table-id="tableid" v-bind.sync="tableInfo" />
          <DropdownDDTableColumnVisibility :table-id="tableid" :headers.sync="tableInfo.headerData" :sort-by="tableInfo.sortBy" :multi="true" />
          <ButtonBTNRefetch :is-loading="isLoadingParent" :tooltip="$t('button.refresh', {id: tableid})" :refetch="fetch" />
        </b-navbar-nav>
      </b-navbar>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { ITableInfo } from '../../.utils/types/ttable'

@Component({ mixins: [Icons] })
export default class BPageHeader extends Vue {
  @Prop({ default: 'expand' }) navbartype!: string
  @Prop({}) title!: string
  @Prop({}) subtitle!: string
  @Prop({}) closeroute!: string
  @Prop({ default: null }) tableid!: string
  @Prop({ default: () => { return {} } }) tableInfo!: ITableInfo
  @Prop({ default: false }) isLoadingParent!: boolean
  @Prop({ default: undefined }) fetch!: Function
  @Prop({ default: false }) childopened!: boolean
  @Prop({ default: false }) treeview!: boolean
  icon:any
  $mq: any
  expanded: boolean = true
  @Watch('childopened', {}) childOpened () { this.expanded = !this.childopened }
}
</script>
