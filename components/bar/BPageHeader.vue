<template>
  <div>
    <b-navbar data-testid="BarBPageHeader" variant="transparent" class="pt-0 pb-1">
      <div v-b-toggle="'collapse' + tableid" :class="navbartype == 'collapse' ? 'btn col-11 text-left border-0 pl-0' : ''">
        <b-icon v-if="navbartype == 'collapse'" class="labelcolor" :icon="expanded ? iconnames.arrowDoubleDown : iconnames.arrowDoubleRight" />
        <span v-if="title" class="labelcolor font-weight-bold">{{ title }}</span>
        <span v-if="subtitle" class="labelcolor font-italic ml-1"> {{ subtitle }} </span>
      </div>
      <b-navbar-nav class="flex-wrap">
        <slot name="left" />
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <slot name="right" />
        <b-button v-if="closeroute" class="border-0" variant="outline-primary" :to="closeroute">
          <span class="sr-only">{{ $t('button.close') }}</span> <b-icon :icon="iconnames.x" />
        </b-button>
      </b-navbar-nav>
    </b-navbar>
    <b-collapse v-if="navbartype == 'collapse' || $mq == 'mobile' && tableid" :id="'collapse' + tableid" v-model="expanded" :visible="expanded">
      <b-navbar class="mb-1 flex-wrap">
        <template v-if="tableid">
          <TreeTSDepots v-if="tableid !== 'Depots'" class="tableheader_depots" />
          <TreeTSHostGroups v-if="tableid !== 'Depots'" class="tableheader_hostgroup" />
          <TreeTSProductGroups v-if="tableid == 'products'" class="tableheader_productgroup" />
        </template>
        <template v-if="$mq == 'mobile'">
          <InputIFilter class="header_filter" :data="tableInfo" />
          <b-navbar-nav class="ml-auto">
            <DropdownDDTableSorting :table-id="tableid" v-bind.sync="tableInfo" />
            <DropdownDDTableColumnVisibility :table-id="tableid" :headers.sync="tableInfo.headerData" :sort-by="tableInfo.sortBy" :multi="true" />
            <ButtonBTNRefetch :is-loading="isLoadingParent" :tooltip="$t('button.refresh', {id: tableid})" :refetch="fetch" />
          </b-navbar-nav>
        </template>
      </b-navbar>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
import { ITableInfo } from '../../.utils/types/ttable'

@Component({ mixins: [Constants] })
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
  iconnames:any
  $mq: any
  expanded: boolean = true
  @Watch('childopened', {}) childOpened () { this.expanded = !this.childopened }
}
</script>
