<template>
  <b-dropdown
    v-bind="$props"
    no-caret
    lazy
    dropleft
    variant="outline-primary"
    size="sm"
    alt="Show column"
    class="fixed_column_selection"
    :title="$t('table.showCol')"
  >
    <template #button-content>
      <b-icon-grid />
    </template>
    <li v-if="$mq=='mobile'">
      <a
        v-for="header in Object.values(headers).filter(h=>h._fixed!==true && h._majorKey==undefined)"
        :key="header.key"
        class="dropdown-item"
        :class="{'_fixed_column_btn_selected_item':columnVisibilityStates[header.key], disabled:header.disabled}"
        :disabled="columnVisibilityStates[header.key]"
        @click="setColumnVisibilityModel(header.key)"
      >
        {{ $t(header.label) }}
      </a>
    </li>
    <li
      v-else
      id="selectableColumns-group"
      name="selectableColumns"
    >
      <a
        v-for="header in Object.values(headers).filter(h=>h._fixed!==true && h.key!='_empty_' && h._majorKey==undefined)"
        :key="header.key"
        class="dropdown-item"
        :class="{'disabled':!header.disabled&&header.disabled!=undefined}"
        @click="handleItem(header.key)"
      >
        <b-form-checkbox
          v-model="columnVisibilityList"
          :name="header.label"
          :value="header.key"
          :class="{'_fixed_column_btn_selected_item':columnVisibilityStates[header.key]}"
        />
        {{ $t(header.label) }}
      </a>
    </li>
  </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { ITableHeaders } from '~/types/ttable'
import { IObjectString2Boolean } from '~/types/tsettings'

@Component
export default class DDTableColumnVisibilty extends BDropdown {
  @Prop({ default: () => { return () => { /* default */ } } }) headers!: ITableHeaders

  columnVisibilityList: Array<string> = []
  columnVisibilityStates: IObjectString2Boolean = {}

  mounted () {
    this.setColumnVisibilityModel(undefined)
    // Object.values(this.headers).forEach((h) => {
    //   this.columnVisibilityStates[h.key] = h.disabled || false
    // })
    // this.columnVisibilityList = Object.values(this.headers).filter(h => h.visible).map(h => h.key)
  }

  @Watch('$mq') mqChanged () {
    if (this.$mq === 'mobile') {
      const firstVisible: string|undefined = Object.keys(this.columnVisibilityStates).find(k => k !== '_empty_' && this.columnVisibilityStates[k])
      this.setColumnVisibilityModel(firstVisible)
    }
  }

  @Watch('columnVisibilityList') keysChanged () {
    this.setColumnVisibilityModel(undefined)
  }

  handleItem (key: string) {
    if (this.columnVisibilityList.includes(key)) {
      this.columnVisibilityList = this.columnVisibilityList.filter(s => s !== key)
    } else {
      this.columnVisibilityList.push(key)
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
          this.headers[ck].visible = this.columnVisibilityStates[k]
        })
      }
    })
  }
}
</script>
<style>
.dropdown-menu {
  height: max-content !important;
}
.dropdown-menu .dropdown-item {
  cursor: pointer;
  display: flex !important;
}
/* .disabled {
  cursor: default;
  display: none;

} */
</style>
