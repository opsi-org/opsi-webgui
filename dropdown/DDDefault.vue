<template>
  <b-dropdown
    v-bind="$props"
    no-caret
    lazy
    variant="outline-primary"
    size="sm"
  >
    <template v-if="multiple" #button-content>
      <b-badge v-for="i in selections" :key="i">
        {{ i }}
      </b-badge>
    </template>
    <template v-else #button-content>
      {{ selections[0] }}
    </template>
    <li v-if="!multiple">
      <a
        v-for="o in options"
        :key="o"
        class="dropdown-item"
        @click="selections = [o]"
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

@Component
export default class DDDefault extends BDropdown {
  @Prop({ default: false }) multiple!: Array<any>
  @Prop({ default: () => { return () => { /* default */ } } }) options!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) selectedItems!: Array<string>
  selections: Array<string> = []
  created () {
    this.selections = this.uniques([...this.selectedItems])
  }

  @Watch('selections') selectionsChanged () {
    this.$emit('change', this.selections)
  }

  @Watch('selectedItems') selectedItemsChanged () {
    this.selections = this.uniques([...this.selectedItems, ...this.selections])
  }

  toggleSelection (item: string) {
    if (!this.selections.includes(item)) {
      this.selections.push(item)
    } else {
      this.selections.splice(this.selections.indexOf(item), 1)
    }
  }

  uniques (arr:Array<any>) {
    return [...new Set(arr)]
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
