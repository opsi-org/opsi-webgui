<template>
  <div v-if="onhover!==false" @mouseover="onOver" @mouseleave="onLeave" @focusin="onOver" @focusout="onLeave">
    <b-dropdown
      ref="dropdown"
      v-bind="$props"
      data-testid="DropdownDDTableColumnVisibility"
      lazy
      right
      :no-caret="incontextmenu == false"
      :toggle-tag="incontextmenu !== false ? 'li': 'button'"
      :variant="incontextmenu !== false ? 'outline-primary': 'outline-primary'"
      size="sm"
      alt="Show column"
      class="DDTableColumnVisibility fixed_column_selection noborder w-100 text-left"
      :class="{ 'absolutright': (incontextmenu !== false) }"
      :toggle-class="{
        'DDTableColumnVisibilityBtn w-100 h-100 text-left': true,
        'dropdown-item': (incontextmenu !== false) }"
      :title="$t('table.showCol')"
      @show="init"
    >
      <template #button-content>
        <IconITableColumn />
        {{ incontextmenu !== false ? 'Columns': ''}}
      </template>
      <template v-if="!multiCondition">
        <b-dropdown-form
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
        </b-dropdown-form>
      </template>
      <template v-else>
        <!-- id="selectableColumns-group"
        name="selectableColumns" -->
        <b-dropdown-form
          v-for="header in Object.values(headers).filter(h=>h._fixed!==true && h.key!='_empty_' && h._majorKey==undefined)"
          :key="header.key"
          class="dropdown-item"
          :class="{'disabled':!header.disabled&&header.disabled!=undefined}"
          @click.prevent="handleItem(header.key)"
        >
          <b-input-group>
            <b-form-checkbox
              v-model="columnVisibilityList"
              :name="header.label"
              :value="header.key"
              :class="{'selected':columnVisibilityStates[header.key]}"
            />
            {{ header.label }}
          </b-input-group>
        </b-dropdown-form>
      </template>
    </b-dropdown>
  </div>
  <b-dropdown
    v-else
    ref="dropdown"
    v-bind="$props"
    data-testid="DropdownDDTableColumnVisibility"
    lazy
    right
    :no-caret="incontextmenu == false"
    :toggle-tag="incontextmenu !== false ? 'li': 'button'"
    :variant="incontextmenu !== false ? 'outline-primary': 'outline-primary'"
    size="sm"
    alt="Show column"
    class="DDTableColumnVisibility fixed_column_selection noborder w-100 text-left"
    :class="{ 'absolutright': (incontextmenu !== false) }"
    :toggle-class="{
      'DDTableColumnVisibilityBtn w-100 h-100 text-left': true,
      'dropdown-item': (incontextmenu !== false) }"
    :title="$t('table.showCol')"
    @show="init"
  >
    <template #button-content>
      <IconITableColumn />
      {{ incontextmenu !== false ? 'Columns': ''}}
    </template>
    <template v-if="!multiCondition">
      <b-dropdown-form
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
      </b-dropdown-form>
    </template>
    <template v-else>
      <!-- id="selectableColumns-group"
      name="selectableColumns" -->
      <b-dropdown-form
        v-for="header in Object.values(headers).filter(h=>h._fixed!==true && h.key!='_empty_' && h._majorKey==undefined)"
        :key="header.key"
        class="dropdown-item"
        :class="{'disabled':!header.disabled&&header.disabled!=undefined}"
        @click.prevent="handleItem(header.key)"
      >
        <b-input-group>
          <b-form-checkbox
            v-model="columnVisibilityList"
            :name="header.label"
            :value="header.key"
            :class="{'selected':columnVisibilityStates[header.key]}"
          />
          {{ header.label }}
        </b-input-group>
      </b-dropdown-form>
    </template>
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
export default class DDTableColumnVisibility extends BDropdown {
  @Prop({ default: 'table' }) tableId!: string
  @Prop({ }) sortBy!: string
  @Prop({ default: undefined }) multi!: boolean|undefined
  @Prop({ default: false }) onhover!: boolean
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) headers!: ITableHeaders
  $mq:any
  viewId = ((this.tableId === 'Localboot') || (this.tableId === 'Netboot')) ? 'products' : this.tableId

  @settings.Getter public twoColumnLayoutCollapsed!: IObjectString2Boolean

  columnVisibilityList: Array<string> = []
  columnVisibilityStates: IObjectString2Boolean = {}

  get multiCondition () {
    return this.multi || (this.$mq === 'mobile' || this.twoColumnLayoutCollapsed[this.viewId])
  }

  created () { this.init() }
  init () {
    if (Cookie.get('column_' + this.viewId)) {
      this.columnVisibilityList = JSON.parse(Cookie.get('column_' + this.viewId) as unknown as any)
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

  @Watch('twoColumnLayoutCollapsed', { deep: true }) layoutChanged () {
    if (this.multiCondition && this.twoColumnLayoutCollapsed[this.viewId]) {
      const firstVisible: string|undefined = Object.keys(this.columnVisibilityStates).find(k => !this.headers[k]._fixed && k !== '_empty_' && this.columnVisibilityStates[k])
      this.setColumnVisibilityModel(firstVisible)
    } else if (this.multiCondition && !this.twoColumnLayoutCollapsed[this.viewId]) {
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
    Cookie.set('column_' + this.viewId, JSON.stringify(this.columnVisibilityList), { expires: 365 })
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

  onOver () {
    if (this.$refs.dropdown) {
      this.$refs.dropdown.visible = true
    }
  }

  onLeave () {
    if (this.$refs.dropdown) {
      this.$refs.dropdown.visible = false
    }
  }
}
</script>
<style>
.DDTableColumnVisibility {
  max-width: fit-content !important;
  /* max-height: inherit !important; */
  max-height: var(--component-height) !important;
  z-index: 30 !important;
}
.DDTableColumnVisibility.absolutright {
  min-width: 100% !important;
  width: 100% !important;
}
.DDTableColumnVisibility .dropdown-menu {
  overflow: visible !important;
  height: max-content !important;
  /* max-height: 300px !important; */
  min-width: 250px !important;
  max-width: 350px !important;
  z-index: 300 !important;
  /* position: sticky !important; */
}
.DDTableColumnVisibility .dropdown-menu .dropdown-item {
  padding: 0px !important;
  cursor: pointer;
}

.DDTableColumnVisibilityBtn {
  height: 100% !important;
  max-height: var(--component-height) !important;
}

.DDTableColumnVisibilityBtn::after {
  float: right;
  margin-top: 10px;
}

.DDTableColumnVisibility.absolutright > li {
  border: unset !important;
  /* color: var(--light) !important; */
  min-width: 100% !important;
}
.DDTableColumnVisibility.absolutright > li:hover {
  border: unset !important;
  /* color: var(--light) !important; */
}
/* .DDTableColumnVisibility .dropdown-menu .dropdown-item {
  cursor: pointer;
  display: flex !important;
} */
/* .DDTableColumnVisibility a.selected.disabled {
  background-color: var(--primary);
  color:var(--light);
}
.DDTableColumnVisibility a.selected {
  background-color: var(--primary);
} */
/* .DDTableColumnVisibility .noborder .btn-outline-primary{
  border: 0;
  box-shadow: none;
} */
</style>
