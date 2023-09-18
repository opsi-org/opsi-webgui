<template>
  <div
    class="DropdownDDTableColumnVisibilityWrapper"
    @mouseover="incontextmenu ? onOver($refs.columndropdown) : null"
    @mouseleave="incontextmenu ? onLeave($refs.columndropdown) : null"
    @focusin="incontextmenu ? onOver($refs.columndropdown) : null"
    @focusout="incontextmenu ? onLeave($refs.columndropdown) : null"
  >
    <b-dropdown
      ref="columndropdown"
      v-bind="$props"
      size="sm"
      data-testid="DropdownDDTableColumnVisibility"
      :variant="incontextmenu? 'transparent border-0' : 'outline-primary border-0'"
      :no-caret="!incontextmenu"
      :title="incontextmenu ? '' : $t('table.showCol')"
      :class="{ 'rightmenu': $mq == 'mobile', 'dropdown-item contextmenu': incontextmenu }"
      :dropright="incontextmenu"
      @show="init"
    >
      <template #button-content>
        <b-icon data-testid="ITableColumn" :icon="icon.columns" />
        <span v-if="incontextmenu">{{ $t('button.showCol') }}</span>
      </template>
      <template v-if="multiCondition">
        <ul>
          <li
            v-for="header in Object.values(headers).filter(h=>h._fixed!==true && h.key!='_empty_' && h._majorKey==undefined)"
            :key="header.key"
            class="dropdown-item"
            :class="{'disabled':!header.disabled&&header.disabled!=undefined}"
            :tabindex="incontextmenu ? undefined : 0"
            @keydown.prevent="handleItem(header.key)"
            @click.prevent="handleItem(header.key)"
          >
            <a class="columnWrapper">
              <b-form-checkbox
                :checked="columnVisibilityList.includes(header.key)"
                :class="{'selectedColumn':columnVisibilityStates[header.key]}"
              >  {{ header.label }} </b-form-checkbox>
            </a>
          </li>
        </ul>
      </template>
      <template v-else>
        <b-dropdown-item
          v-for="header in Object.values(headers).filter(h=>h._fixed!==true && h._majorKey==undefined)"
          :key="header.key"
          inline
          :class="{
            'selectedColumn':columnVisibilityStates[header.key] || columnVisibilityList.includes(header.key),
            disabled: header.disabled!=undefined&&header.disabled,
          }"
          @click.prevent="setColumnVisibilityModel(header.key)"
        >
          {{ header.label }}
        </b-dropdown-item>
      </template>
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Watch } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { ITableHeaders } from '../../.utils/types/ttable'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { HoverDropdown } from '../../mixins/component'
import { Icons } from '../../mixins/icons'
import { Cookies } from '../../mixins/cookies'
const settings = namespace('settings')

@Component({ mixins: [Icons, HoverDropdown, Cookies] })
export default class DDTableColumnVisibility extends BDropdown {
  icon:any
  $mq:any
  getParsedCookie: any
  setCookie: any
  existsCookie: any
  onOver:any
  onLeave:any
  @Prop({ default: 'table' }) tableId!: string
  @Prop({ }) sortBy!: string
  @Prop({ default: undefined }) multi!: boolean|undefined
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) headers!: ITableHeaders
  viewId = ((this.tableId === 'Localboot') || (this.tableId === 'Netboot')) ? 'products' : this.tableId

  @settings.Getter public twoColumnLayoutCollapsed!: IObjectString2Boolean

  columnVisibilityList: Array<string> = []
  columnVisibilityStates: IObjectString2Boolean = {}

  get multiCondition () {
    return this.multi ?? (this.$mq === 'mobile' || this.twoColumnLayoutCollapsed[this.viewId])
  }

  created () { this.init() }
  init () {
    if (this.existsCookie('column_' + this.viewId)) {
      this.columnVisibilityList = this.getParsedCookie('column_' + this.viewId)
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

  @Watch('headers', { deep: true }) headersChanged () { this.$emit('update:headers', this.headers) }
  @Watch('sortBy', { deep: true }) sortByChanged () {
    if (!this.headers[this.sortBy] || this.headers[this.sortBy].visible) { return }
    const majorKey = this.headers[this.sortBy]._majorKey
    let sortBy = this.sortBy
    if (majorKey) { sortBy = majorKey }

    if (!this.multiCondition) {
      this.setColumnVisibilityModel(sortBy)
    } else {
      this.handleItem(sortBy)
    }
  }

  @Watch('$mq') mqChanged () {
    if (!this.multiCondition && this.$mq === 'mobile') {
      const firstVisible: string|undefined = Object.keys(this.columnVisibilityStates).find(k => k !== '_empty_' && this.columnVisibilityStates[k])
      this.setColumnVisibilityModel(firstVisible)
    }
  }

  // @Watch('twoColumnLayoutCollapsed', { deep: true }) layoutChanged () {
  //   console.error('VISIBILITYX', this.twoColumnLayoutCollapsed)
  //   if (this.multiCondition && this.twoColumnLayoutCollapsed[this.viewId]) {
  //     const firstVisible: string|undefined = Object.keys(this.columnVisibilityStates).find(k => !this.headers[k]._fixed && k !== '_empty_' && this.columnVisibilityStates[k])
  //     this.setColumnVisibilityModel(firstVisible)
  //   } else if (this.multiCondition && !this.twoColumnLayoutCollapsed[this.viewId]) {
  //     const firstVisible: string|undefined = Object.keys(this.columnVisibilityStates).find(k => !this.headers[k]._fixed && k !== '_empty_' && this.columnVisibilityStates[k])
  //     this.setColumnVisibilityModel(firstVisible)
  //   }
  // }

  @Watch('columnVisibilityList') keysChanged () {
    this.setColumnVisibilityModel(undefined)
  }

  handleItem (key: string) {
    if (this.columnVisibilityList.includes(key)) {
      this.columnVisibilityList = this.columnVisibilityList.filter(s => s !== key)
    } else {
      this.columnVisibilityList.push(key)
    }
    this.setCookie('column_' + this.viewId, JSON.stringify(this.columnVisibilityList), { expires: 365 })
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
      if (this.headers[k] && !this.headers[k]._isMajor) {
        this.headers[k].visible = this.columnVisibilityStates[k]
      } else {
        Object.values(this.headers).filter(h => h._majorKey === k).map(h => h.key).forEach((ck) => {
          this.headers[ck].visible = this.columnVisibilityStates[k]
        })
      }
    })
    // triggerupdate
    this.$emit('update:headers', this.headers)
  }
}
</script>

<style>
.DropdownDDTableColumnVisibilityWrapper .selectedColumn .dropdown-item {
  color: var(--light) !important;
  background-color: var(--primary-dark) !important;
}
.DropdownDDTableColumnVisibilityWrapper .rightmenu .dropdown-menu {
  right: 0 !important;
}
.DropdownDDTableColumnVisibilityWrapper .columnWrapper > div {
  display: inline-block !important;
}
.DropdownDDTableColumnVisibilityWrapper .dropdown-menu > ul {
  padding: 0;
}
.DropdownDDTableColumnVisibilityWrapper .dropdown-menu.show{
  position: absolute !important;
  left: auto;
  right: 0;
}
</style>
