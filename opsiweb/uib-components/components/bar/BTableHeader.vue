<template>
  <b-navbar size="sm">
    <InputIFilter :data="tableInfo" v-bind.sync="tableInfo" />
    <DropdownDDTableSorting :table-id="tableid" v-bind.sync="tableInfo" />
    <DropdownDDTableColumnVisibility :table-id="tableid" :headers.sync="tableInfo.headerData" :sort-by="tableInfo.sortBy" :multi="true" />
    <ButtonBTNRefetch :is-loading="isLoadingParent" :tooltip="$t('button.refresh', {id: tableid})" :refetch="fetch" />
  </b-navbar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ITableInfo } from '../../.utils/types/ttable'
@Component
export default class BarBTableHeader extends Vue {
  @Prop({ default: null }) tableid!: string
  @Prop({ default: () => { return {} } }) tableInfo!: ITableInfo
  @Prop({ default: false }) isLoadingParent!: boolean
  @Prop({ default: undefined }) fetch!: Function
}
</script>
