<template>
  <b-form-row class="TCProductPropertyValue_Container justify-content-md-center">
    <b-col
      class="TCProductPropertyValue_Value"
      :class="{'d-none' : rowItem.propertyId.includes('password') && !showValue}"
      @click.middle="() => { (rowItem.editable) ? rowItem.newValue = `${selectedValues}`: () => {} } "
    >
      <b-form-checkbox
        v-if="rowItem.type=='BoolProductProperty'"
        style="display:inline"
        :class="{'value-changed-not-saved': !isOrigin }"
        :checked="selectedValues[0]"
        :aria-label="rowItem.propertyId + (selectedValues[0]?'checked':'unchecked')"
        :indeterminate="visibleValueBoolIndeterminate"
        @change="handleBoolChange"
      >
        {{ isOrigin? '': '*' }}
      </b-form-checkbox>
      <LazyDropdownDDDefault
        v-else-if="rowItem.type=='UnicodeProductProperty'"
        :is-origin="isOrigin"
        :options="allOptionsUnique"
        :selected-items="selectedValues"
        :multiple="rowItem.multiValue"
        @change="selectionChanged"
      />
      <!-- {{!arrayEqual(selectedValuesOriginal, selectedValues)? 'CHANGED-notsaved':''}} -->
    </b-col>
    <b-col v-if="rowItem.editable" :class="{'d-none' : rowItem.propertyId.includes('password') && !showValue}" cols="*">
      <slot :class="{'d-none' : rowItem.propertyId.includes('password') && !showValue}" name="editable-button" />
    </b-col>
    <b-col v-if="rowItem.propertyId.includes('password')" class="TCProductPropertyValue_ShowBtn" cols="*">
      <b-button :pressed.sync="showValue" size="sm" variant="outline-primary">
        <b-icon v-if="showValue" icon="eye-slash" />
        <b-icon v-else icon="eye" />
      </b-button>
    </b-col>
    <b-col v-if="showTooltip" class="TCProductPropertyValue_MixedTT" cols="*">
      <IconIDetails :id="`DDProductProperty_value_hover_${rowItem.propertyId}`" class="right" />
      <TooltipTTProductCell
        v-if="showTooltip"
        type="property"
        :target="`DDProductProperty_value_hover_${rowItem.propertyId}`"
        :details="rowItem.clients"
      />
    </b-col>
  </b-form-row>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { IProperty } from '~/scripts/types/ttable'
import { IObjectString2String } from '~/scripts/types/tgeneral'
import { arrayEqual } from '~/scripts/utils/scompares'
const selections = namespace('selections')
// const mixed = '<mixed>'
@Component
export default class TProductPropertyValue extends Vue {
  // @Prop() type!: 'unicode'|'bool'|'functional'
  @Prop() rowItem!: IProperty
  @Prop() clients2depots!: IObjectString2String
  @Prop({ default: () => { return [] } }) valuesNew!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  showValue : boolean = false
  changedValue: Array<string>|undefined
  selectedValues!: Array<string|boolean>
  // selectedValuesOriginal!: Array<string|boolean>
  isOrigin: boolean = true
  visibleValueBool!: boolean
  visibleValueBoolIndeterminate!: boolean

  created () {
    this.selectedValues = JSON.parse(JSON.stringify(this.selectedValuesOriginal))
  }

  @Watch('showValue', { deep: true }) showValuesChanged () { if (!this.showValue) { this.rowItem._showDetails = this.showValue } }

  @Watch('selectedValues', { deep: true }) selectedValuesChanged () {
    // if (!arrayEqual(this.selectedValues, this.selectedValuesOriginal)) {
    //   this.$emit('change', this.rowItem.propertyId, this.selectedValues, this.selectedValuesOriginal)
    // }
    this.$emit('change', this.rowItem.propertyId, this.selectedValues, this.selectedValuesOriginal)
    this.isOrigin = arrayEqual(this.selectedValues, this.selectedValuesOriginal)
  }

  @Watch('rowItem.clients', { deep: true }) rowItemClientsChanged () { this.selectedValues = JSON.parse(JSON.stringify(this.selectedValuesOriginal)) }
  @Watch('rowItem.depots', { deep: true }) rowItemDepotsChanged () { this.selectedValues = JSON.parse(JSON.stringify(this.selectedValuesOriginal)) }
  @Watch('rowItem.newValues', { deep: true }) newValuesChanged (newV:Array<any>, oldV:Array<any>) {
    if (this.rowItem.newValues === undefined) { return }
    if (arrayEqual(oldV, newV) && newV.length === 0) { return }
    if (this.rowItem.multiValue) {
      this.selectedValues = this.uniques([...this.selectedValues, ...this.rowItem.newValues || []])
    } else {
      this.selectedValues = [this.rowItem.newValue || '']
    }
    this.selectedValuesChanged()
  }

  get allOptionsUnique () {
    const options = this.uniques([...this.rowItem.allValues, this.rowItem.newValue, ...this.rowItem.newValues || []])
    if (this.selectedValuesOriginal.includes(this.$t('values.mixed') as string)) {
      options.push(this.$t('values.mixed') as string)
    }
    return options
  }

  get selectedValuesOriginal () {
    if (this.rowItem.type === 'BoolProductProperty') {
      this.visibleValueBoolIndeterminate = false
    }

    if (Object.keys(this.rowItem.clients).length > 0 && this.rowItem.allClientValuesEqual) {
      if (this.rowItem.type === 'BoolProductProperty') {
        this.visibleValueBool = Object.values(this.rowItem.clients)[0][0] as boolean
      }
      return Object.values(this.rowItem.clients)[0]
    } else if (Object.keys(this.rowItem.clients).length > 0 && !this.rowItem.allClientValuesEqual) {
      this.visibleValueBoolIndeterminate = true
      return [this.$t('values.mixed') as string] // for boolean egal, cause indeterminate=true
    }

    if (Object.keys(this.rowItem.depots).length > 0 && Object.values(this.rowItem.depots).every(v => v === Object.values(this.rowItem.depots)[0])) {
      return Object.values(this.rowItem.depots)[0]
    } else if (Object.keys(this.rowItem.depots).length > 0 && Object.values(this.rowItem.depots).some(v => v !== Object.values(this.rowItem.depots)[0])) {
      this.visibleValueBoolIndeterminate = true
      return [this.$t('values.mixed') as string] // for boolean egal, cause indeterminate=true
    }
    // eslint-disable-next-line no-console
    console.error(this.rowItem.propertyId, ': ', this.rowItem.clients.length, this.rowItem.allClientValuesEqual)
    return ['--error--']
  }

  get showTooltip () {
    if (this.rowItem.type === 'UnicodeProductProperty') {
      return this.selectedValuesOriginal.includes(this.$t('values.mixed') as string)
    }
    if (this.rowItem.type === 'BoolProductProperty') {
      return this.visibleValueBoolIndeterminate
    }
    return true
  }

  uniques (arr:Array<any>) {
    return [...new Set(arr)]
  }

  handleBoolChange () {
    this.selectedValues = JSON.parse(JSON.stringify([!this.selectedValues[0]]))
    this.selectedValuesChanged()
  }

  selectionChanged (values: Array<string|boolean>) {
    this.selectedValues = JSON.parse(JSON.stringify(values))
    this.selectedValuesChanged()
  }
}
</script>

<style>
.dropdown {
  max-width: -moz-available;
  max-width: -moz-available;          /* For Mozzila */
  max-width: -webkit-fill-available;  /* For Chrome */
}
.TCProductPropertyValue_Value .dropdown > .dropdown-menu,
.TCProductPropertyValue_Value .dropdown > .dropdown-menu .dropdown-item {
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
}
.TCProductPropertyValue_Value .dropdown button {
  text-overflow: ellipsis;
  overflow: hidden;
}
.btn-group, .btn-group-vertical {
  display: grid !important;
}
</style>
