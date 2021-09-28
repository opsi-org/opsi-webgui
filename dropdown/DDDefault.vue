<template>
  <b-dropdown
    v-bind="$props"
    no-caret
    lazy
    variant="outline-primary"
    size="sm"
  >
    <template v-if="multiple" #button-content>
      <b-badge v-for="i in selections" :key="i" variant="primary">
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
        :class="{'dropdown-item-selected': selections.includes(o), multiValue: multiple, singleValue: !multiple}"
        @click="(!selections.includes(0))?selections = [o]:()=>{}"
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
        :class="{'dropdown-item-selected': selections.includes(o), multiValue: multiple, singleValue: !multiple}"
        @click="(!selections.includes(0))? toggleSelection(o):()=>{}"
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
import { arrayEqual } from '~/helpers/hcompares'
import { arrEqual } from '~/helpers/equal'

@Component
export default class DDDefault extends BDropdown {
  @Prop({ default: false }) multiple!: Array<any>
  @Prop({ default: () => { return () => { /* default */ } } }) options!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) selectedItems!: Array<string>
  selections: Array<string> = []
  created () {
    this.selections = this.uniques([...this.selectedItems])
    console.debug(arrayEqual(this.selectedItems, this.selections))
  }

  @Watch('selections') selectionsChanged (newV:any, oldV:any) {
    if (arrEqual(this.selectedItems, this.selections)) { return }
    if (arrEqual(oldV, newV)) { return }
    console.debug('selectionsChanged old->new', oldV, newV)
    // const localSelection = this.selections])
    if (this.selections.length > 1) {
      const index = this.selections.indexOf(this.$t('values.mixed') as string)
      if (index > -1) {
        this.selections.splice(index, 1)
      }
    }
    // this.selections = localSelection
    this.$emit('change', this.selections)
  }

  @Watch('selectedItems') selectedItemsChanged (newV:any, oldV:any) {
    if (arrayEqual(this.selectedItems, this.selections)) { return }
    console.debug('selectedItemsChanged old->new', oldV, newV)
    const localSelection = this.uniques([...this.selectedItems, ...this.selections])
    // const index = localSelection.indexOf(this.$t('values.mixed') as string)
    // if (index > -1) {
    //   localSelection.splice(index, 1)
    // }
    this.selections = localSelection
  }

  toggleSelection (item: string) {
    // multValue
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

.dropdown-menu .singleValue.dropdown-item-selected:hover,
.dropdown-menu .singleValue.dropdown-item-selected {
  cursor:default !important;
  background-color: var(--primary);
}
.dropdown-menu .dropdown-item {
  cursor: pointer;
  /* display: grid !important; */
}
</style>
