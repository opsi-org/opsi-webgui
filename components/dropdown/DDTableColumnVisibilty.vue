<template>
  <b-dropdown
    v-bind="$props"
    data-testid="DropdownDDTableColumnVisibilty"
    no-caret
    lazy
    right
    variant="outline-primary"
    size="sm"
    alt="Show column"
    class="DDTableColumnVisibilty fixed_column_selection noborder"
    :title="$t('table.showCol')"
  >
    <template #button-content>
      <IconITableColumn />
    </template>
    <li v-if="$mq=='mobile' || twoColumnLayoutCollapsed[tableId]">
      <a
        v-for="header in Object.values(headers).filter(h=>h._fixed!==true && h._majorKey==undefined)"
        :key="header.key"
        class="dropdown-item"
        :class="{
          'selected':columnVisibilityStates[header.key] || columnVisibilityList.includes(header.key),
          disabled: header.disabled!=undefined&&header.disabled,
        }"
        variant="primary"
        @click.prevent="setColumnVisibilityModel(header.key)"
      >
        <!-- :disabled="columnVisibilityStates[header.key]" -->
        {{ header.label }}
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
        @click.prevent="handleItem(header.key)"
      >
        <b-form-checkbox
          v-model="columnVisibilityList"
          :name="header.label"
          :value="header.key"
          :class="{'selected':columnVisibilityStates[header.key]}"
        />
        {{ header.label }}
      </a>
    </li>
  </b-dropdown>
</template>

<script lang="ts">
import Cookie from 'js-cookie'
import { Component, namespace, Prop, Watch } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { ITableHeaders } from '../../.utils/types/ttable'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
const settings = namespace('settings')

@Component
export default class DDTableColumnVisibilty extends BDropdown {
  @Prop({ default: 'table' }) tableId!: string
  @Prop({ default: () => { return () => { /* default */ } } }) headers!: ITableHeaders
  $mq:any

  @settings.Getter public twoColumnLayoutCollapsed!: IObjectString2Boolean

  columnVisibilityList: Array<string> = []
  columnVisibilityStates: IObjectString2Boolean = {}

  created () {
    if (Cookie.get('column_' + this.tableId)) {
      this.columnVisibilityList = JSON.parse(Cookie.get('column_' + this.tableId) as unknown as any)
    } else {
      Object.values(this.headers).filter(k => !k._isMajor).forEach((h) => {
        if (h._majorKey) {
          this.columnVisibilityStates[this.headers[h._majorKey].key] = h.visible || false
        } else {
          this.columnVisibilityStates[h.key] = h.visible || false
        }
      })
      this.columnVisibilityList = Object.keys(this.columnVisibilityStates).filter(k => this.columnVisibilityStates[k])
    }
  }

  @Watch('$mq') mqChanged () {
    if (this.$mq === 'mobile') {
      const firstVisible: string|undefined = Object.keys(this.columnVisibilityStates).find(k => k !== '_empty_' && this.columnVisibilityStates[k])
      this.setColumnVisibilityModel(firstVisible)
    }
  }

  @Watch('twoColumnLayoutCollapsed', { deep: true }) layoutChanged () {
    if (this.twoColumnLayoutCollapsed[this.tableId] && this.$mq !== 'mobile') {
      const firstVisible: string|undefined = Object.keys(this.columnVisibilityStates).find(k => !this.headers[k]._fixed && k !== '_empty_' && this.columnVisibilityStates[k])
      this.setColumnVisibilityModel(firstVisible)
    } else if (!this.twoColumnLayoutCollapsed[this.tableId] && this.$mq !== 'mobile') {
      const firstVisible: string|undefined = Object.keys(this.columnVisibilityStates).find(k => !this.headers[k]._fixed && k !== '_empty_' && this.columnVisibilityStates[k])
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
    Cookie.set('column_' + this.tableId, JSON.stringify(this.columnVisibilityList), { expires: 365 })
  }

  setColumnVisibilityModel (tableKey: string|undefined) {
    if (tableKey === undefined) {
      return
    }
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
.DDTableColumnVisibilty {
  max-width: fit-content !important;
  max-height: fit-content !important;
}
.DDTableColumnVisibilty .dropdown-menu {
  height: max-content !important;
  z-index: 3 !important;
  /* position: sticky; */
}
.DDTableColumnVisibilty .dropdown-menu .dropdown-item {
  cursor: pointer;
  display: flex !important;
}
.DDTableColumnVisibilty a.selected.disabled {
  background-color: var(--primary);
  color:var(--light);
}
.DDTableColumnVisibilty a.selected {
  background-color: var(--primary);
}
.DDTableColumnVisibilty .noborder .btn-outline-primary{
  border: 0;
  box-shadow: none;
}
</style>
