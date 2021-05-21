<template>
  <b-dropdown
    v-bind="$props"
    no-caret
    lazy
    dropup
    variant="outline-primary"
    size="sm"
    class="fixed_column_selection"
  >
    <template #button-content>
      <b-icon-list-task />
    </template>
    <div v-if="$mq=='mobile'">
      <b-dropdown-item-button
        v-for="header in Object.values(headers).filter(h=>h._fixed!==true && h._majorKey==undefined)"
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
          v-for="header in Object.values(headers).filter(h=>h._fixed!==true && h.key!='_empty_' && h._majorKey==undefined)"
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

<script lang="ts">
import { Component, Prop, Watch } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { ITableHeaders } from '~/types/tsettings'

@Component
export default class DDTableColumnVisibilty extends BDropdown {
  @Prop({ default: () => { return () => { /* default */ } } }) headers!: ITableHeaders

  columnVisibilityList: Array<string> = []
  columnVisibilityStates: { [key: string]: boolean; } = {}

  @Watch('$mq') mqChanged () {
    if (this.$mq === 'mobile') {
      const firstVisible: string|undefined = Object.keys(this.columnVisibilityStates).find(k => k !== '_empty_' && this.columnVisibilityStates[k])
      this.setColumnVisibilityModel(firstVisible)
    }
  }

  @Watch('columnVisibilityList') keysChanged () {
    this.setColumnVisibilityModel(undefined)
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
      this.columnVisibilityList = Object.keys(this.columnVisibilityStates).filter(k => this.columnVisibilityStates[k])
    } else {
      // set selected columns to true (desktop-view)
      this.columnVisibilityList.forEach((k: string) => {
        this.columnVisibilityStates[k] = true
      })
    }
    // change visibilty of children if any major column is selected
    Object.keys(this.columnVisibilityStates).forEach((k) => {
      if (!this.headers[k]._isMajor) {
        this.headers[k].visible = this.columnVisibilityStates[k]
      } else {
        Object.values(this.headers).filter(h => h._majorKey === k).map(h => h.key).forEach((ck) => {
          // console.log(`found children of major ${k}:`, ck)
          this.headers[ck].visible = this.columnVisibilityStates[k]
        })
      }
    })
  }
}
</script>
