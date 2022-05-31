<template>
  <div
    data-testid="DropdownDDDefault"
  >
    <b-dropdown
      v-bind="$props"
      data-testid="DropdownDDDefault-Button"
      no-caret
      lazy
      :toggle-class="{'value-changed-not-saved': !isOrigin, 'DDDefault-BtnContent': true }"
      variant="outline-primary"
      size="sm"
    >
      <template v-if="multiple==true" #button-content>
        <b-badge v-for="i in selections" :key="i" variant="primary">
          {{ i }}
        </b-badge>
        {{ !isOrigin? '*':'' }}
      </template>
      <template v-else #button-content>
        {{ selections[0] }}
        {{ !isOrigin? '*':'' }}
      </template>

      <li v-if="!multiple">
        <a
          v-for="o in options"
          :key="o"
          :data-testid="`DropdownDDDefault-Item-${o}`"
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
          :data-testid="`DropdownDDDefault-Item-${o}`"
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
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'nuxt-property-decorator'

import { BDropdown } from 'bootstrap-vue'
import { arrayEqual } from '../../.utils/utils/scompares'

@Component
export default class DDDefault extends BDropdown {
  @Prop({ default: false }) multiple!: boolean
  @Prop({ default: true }) isOrigin!: boolean
  @Prop({ }) options!: Array<string>
  @Prop({ }) selectedItems!: Array<string>
  selections: Array<string> = []

  mounted () {
    this.selections = this.uniques([...this.selectedItems])
  }

  @Watch('selections') selectionsChanged () {
    if (arrayEqual(this.selectedItems, this.selections)) { return }
    if (this.selections.length > 1) {
      const index = this.selections.indexOf(this.$t('values.mixed') as string)
      if (index > -1) {
        this.selections.splice(index, 1)
      }
    }
    if (arrayEqual(this.selectedItems, this.selections)) { return }
    this.$emit('change', this.selections)
  }

  @Watch('selectedItems') selectedItemsChanged () {
    if (arrayEqual(this.selectedItems, this.selections)) { return }
    if (this.multiple) {
      this.selections = this.uniques([...this.selectedItems, ...this.selections])
    } else {
      this.selections = this.uniques([...this.selectedItems])
    }
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
.DDDefault-BtnContent {
  text-align: left !important;
  min-width: 150px !important;
}
/* .dropdown-menu {
  height: max-content !important;
} */

/* .dropdown-menu .singleValue.dropdown-item-selected:hover,
.dropdown-menu .singleValue.dropdown-item-selected {
  cursor:default !important;
  background-color: var(--primary);
} */
/* .dropdown-menu .dropdown-item {
  cursor: pointer;
} */
/* .dropdown-menu .custom-control.custom-checkbox {
  display: inline;
} */
</style>
