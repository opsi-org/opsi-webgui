<template>
  <div>
    <!-- F: {{fields}}<br />
    H: {{headers}}<br /> -->
    <!-- :fields="headers" -->
    <b-table
      v-bind="$props"
      :class="$mq"
      @row-selected="rowchanged"
    >
      <template #cell(sel)="row">
        <!-- {{datakey}}: {{selection}} -->
        <b-icon-check2 v-if="row.rowSelected || selection.includes(row.item[datakey])">
          {{ fixRow(row) }}
        </b-icon-check2>
      </template>

      <template #head(actions)="{}">
        <!-- <div /></template> -->
        <!-- <template #head(_select_visible_column)=""> -->
        <b-dropdown
          no-caret
          lazy
          dropup
          variant="outline-primary"
          size="sm"
          class="fixed_column_selection"
        >
          <template #button-content><b-icon-list-task /></template>
          <div v-if="$mq=='mobile'">
            <b-dropdown-item-button
              v-for="header in Object.values(headers).filter(h=>h._fixed!==true)"
              :key="header.key"
              class="_fixed_column_btn"
              :class="{'_fixed_column_btn_selected_item':columnVisibilityStates[header.key]}"
              :disabled="columnVisibilityStates[header.key]"
              @click="setColumnVisibilityModel(header.key)"
            >
              {{ header.label }} <!-- {{ $t(header.label) }} -->
            </b-dropdown-item-button>
          </div>
          <div v-else>
            <b-form-checkbox-group id="selectableColumns-group" v-model="columnVisibilityList" name="selectableColumns">
              <b-form-checkbox
                v-for="header in Object.values(headers).filter(h=>h._fixed!==true && h.key!='_empty_')"
                :key="header.key"
                :value="header.key"
                class="_fixed_column_btn"
                :class="{'_fixed_column_btn_selected_item':columnVisibilityStates[header.key]}"
              >
                {{ header.label }}
              </b-form-checkbox>
            </b-form-checkbox-group>
          </div>
        </b-dropdown>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'nuxt-property-decorator'
import { BTable } from 'bootstrap-vue'
import { ITableRow, ITableHeaders } from '~/types/tsettings'
// const selections = namespace('selections')

@Component
export default class TTable extends BTable {
  @Prop({ }) datakey!: string
  @Prop({ default: () => { return [] } }) readonly selection!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) rowchanged!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) headers!: ITableHeaders
  // @Prop({ default: () => { return () => { /* default */ } } }) fetch!: Function
  // visibleColumns: object = {}
  columnVisibilityList: Array<string> = []
  columnVisibilityStates: { [key: string]: boolean; } = {}
  // headers: Array<ITableHeader> = []

  // @Watch('tableData', { deep: true }) visibleFields () {
  //   // if (this.fields === undefined) { return }
  //   // const fields: ITableHeaders = this.fields as unknown as ITableHeaders
  //   // this.headers = Object.values(fields).filter((h) => { return (h.visible || h._fixed) })
  // }

  @Watch('$mq') mqChanged () {
    if (this.$mq === 'mobile') {
      const firstVisible: string|undefined = Object.keys(this.columnVisibilityStates).find(k => k !== '_empty_' && this.columnVisibilityStates[k])
      this.setColumnVisibilityModel(firstVisible)
    }
  }

  @Watch('columnVisibilityList') keysChanged () {
    this.setColumnVisibilityModel(undefined)
  }

  fixRow (row: ITableRow): void {
    row.rowSelected = this.selection.includes(row.item.ident)
    if (row.rowSelected) {
      const elem = document.getElementById(`__row_${row.item.ident}`)
      if (elem) { elem.classList.add('b-table-row-selected') }
      row.item._rowVariant = 'primary'
    } else {
      const elem = document.getElementById(`__row_${row.item.ident}`)
      if (elem) { elem.classList.remove('b-table-row-selected') }
      row.item._rowVariant = ''
    }
  }

  setColumnVisibilityModel (tableKey: string|undefined) {
    // set all columns to false
    Object.keys(this.columnVisibilityStates).forEach((k) => {
      this.columnVisibilityStates[k] = false
      this.headers[k].visible = false
    })

    // set one columns to true (mobile-view)
    if (tableKey !== undefined) {
      this.columnVisibilityStates[tableKey] = true
      this.headers[tableKey].visible = true
      this.columnVisibilityList = Object.keys(this.columnVisibilityStates).filter(k => this.columnVisibilityStates[k])
    } else {
      // set selected columns to true (desktop-view)
      Object.keys(this.columnVisibilityList).forEach((k) => {
        this.columnVisibilityStates[this.columnVisibilityList[k]] = true
        this.headers[this.columnVisibilityList[k]].visible = true
      })
    }
  }
}
</script>

<style>
.table.desktop {}
.table.mobile {}

.fixed_column_selection{
  float: right;
}
._fixed_column_btn_selected_item{
  background-color: var(--primary_light);
}
</style>
