<template>
  <b-dropdown
    v-bind="$props"
    no-caret
    lazy
    variant="outline-primary"
    size="sm"
  >
    <template v-if="multiple" #button-content>
      <b-badge v-for="i in selectedItems" :key="i">
        {{ i }}
      </b-badge>
    </template>
    <template v-else #button-content>
      {{ selectedItems[0] }}
    </template>
    <li v-if="!multiple">
      <a
        v-for="o in options"
        :key="o"
        class="dropdown-item"
        @click="selectionHandler(o)"
      >
        {{ o }}
      </a>
    </li>
    <li
      v-else
      id="selectableColumns-group"
      name="selectableColumns"
    >
      <a
        v-for="o in options"
        :key="o"
        class="dropdown-item"
        @click="toggleSelection(o)"
      >
        <b-form-checkbox
          v-model="selections"
          :name="o"
          :value="o"
          @change="toggleSelection(o)"
        />
        {{ o }}
      </a>
    </li>
  </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
// import { IObjectString2Boolean } from '~/types/tsettings'
// import { ITableHeaders } from '~/types/ttable'

@Component
export default class DDDefault extends BDropdown {
  @Prop({ default: false }) multiple!: Array<any>
  @Prop({ default: () => { return () => { /* default */ } } }) options!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) selectedItems!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) selectionHandler!: Function

  // options2selection: IObjectString2Boolean = {}
  selections: Array<string> = []
  created () {
    this.selections = [...this.selectedItems]
  }

  @Watch('selections') keysChanged () {
    this.selectionHandler(this.selections)
  }

  toggleSelection (item: string) {
    if (!this.selections.includes(item)) {
      this.selections.push(item)
    } else {
      this.selections.splice(this.selections.indexOf(item), 1)
    }
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
</style>
