<template>
  <div>
    <b-navbar data-testid="BarBPageHeader" variant="transparent" class="pt-0">
      <div v-b-toggle="'collapse' + tableid" :class="navbartype == 'collapse' ? 'btn col-11 text-left border-0 pl-0' : ''">
        <template v-if="navbartype == 'collapse'">
          <b-icon v-if="expanded" :icon="iconnames.arrowDoubleDown" />
          <b-icon v-else :icon="iconnames.arrowDoubleRight" />
        </template>
        <b v-if="title">{{ title }}</b>
        <span v-if="subtitle" class="font-italic ml-1">
          {{ subtitle }}
        </span>
        <slot name="left" />
      </div>
      <b-navbar-nav class="ml-auto">
        <slot name="right" />
        <b-button v-if="closeroute" class="border-0" variant="outline-primary" :to="closeroute">
          <span class="sr-only">{{ $t('button.close') }}</span>
          <b-icon :icon="iconnames.x" />
        </b-button>
      </b-navbar-nav>
    </b-navbar>
    <b-collapse v-if="navbartype == 'collapse' || $mq == 'mobile' && tableid" :id="'collapse' + tableid" v-model="expanded" :visible="expanded">
      <b-navbar class="mb-1" :class="$mq == 'mobile' || childopened ? 'flex-wrap' : ''">
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

<style>
</style>
