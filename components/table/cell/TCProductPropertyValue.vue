<template>
  <b-form-row class="TCProductPropertyValue_Container justify-content-md-center">
    <b-col
      class="TCProductPropertyValue_Value"
      :class="{'d-none' : rowItem.propertyId.includes('password') && !showValue}"
      @click.middle="() => { (rowItem.editable) ? rowItem.newValue = `${selectedValues}`: () => {} } "
    >
      <b-form-checkbox
        v-if="rowItem.type=='BoolProductProperty'"
        :class="{'TCProductPropertyValue_ValueBool':true,'value-changed-not-saved': !isOrigin }"
        :checked="selectedValues[0]"
        :disabled="(config)? config.read_only : false"
        :aria-label="rowItem.propertyId + (selectedValues[0]?'checked':'unchecked')"
        :indeterminate="visibleValueBoolIndeterminate"
        @change="handleBoolChange"
      >
        <span style="font-size: 25px;"> {{ isOrigin? '': '*' }} </span>
        <!-- TODO -->
      </b-form-checkbox>
      <TreeTSDefault
        v-else-if="rowItem.type=='UnicodeProductProperty'"
        :id="'PropertyValue-' + rowItem.propertyId"
        type="propertyvalues"
        :disabled="(config)? config.read_only : false"
        :text="undefined"
        :show-selection-count="selectedValues.length>1 || !isOrigin"
        :limit-visible-selection="1"
        :multi="rowItem.multiValue"
        :editable="rowItem.editable"
        :selection-default="selectedValues"
        :is-list="true"
        :fetch-data="() => allOptionsUnique"
        :is-origin="isOrigin"
        @change="selectionChanged"
      />
    </b-col>
    <b-col v-if="rowItem.propertyId.includes('password')" class="TCProductPropertyValue_ShowBtn" cols="*">
      <b-button :pressed.sync="showValue" size="sm" variant="outline-primary">
        <b-icon v-if="showValue" :icon="iconnames.valueShow" />
        <b-icon v-else :icon="iconnames.valueHide" />
      </b-button>
    </b-col>
    <b-col v-if="showTooltip" class="TCProductPropertyValue_MixedTT" cols="*">
      <IconIDetails :id="`DDProductProperty_value_hover_${rowItem.propertyId}`" class="right" content="ppv-client-different" />
      <TooltipTTProductCell
        v-if="showTooltip"
        type="property"
        :target="`DDProductProperty_value_hover_${rowItem.propertyId}`"
        :details="rowItem.clients"
        :changes="tooltipChanges"
      />
    </b-col>
  </b-form-row>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { IProperty } from '../../../.utils/types/ttable'
import { IObjectString2Boolean, IObjectString2String } from '../../../.utils/types/tgeneral'
import { arrayEqual } from '../../../.utils/utils/scompares'
import { Constants } from '../../../mixins/uib-mixins'
const settings = namespace('settings')
const selections = namespace('selections')
const changes = namespace('changes')
const config = namespace('config-app')
// const mixed = '<mixed>'

@Component({ mixins: [Constants] })
export default class TProductPropertyValue extends Vue {
  $t:any
  iconnames:any
  // @Prop() type!: 'unicode'|'bool'|'functional'
  @Prop() rowItem!: IProperty
  @Prop() clients2depots!: IObjectString2String
  @Prop({ default: () => { return [] } }) valuesNew!: Array<string>

  @config.Getter public config!: IObjectString2Boolean
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @changes.Getter public changesProducts!: Array<any>
  @changes.Mutation public deleteFromChangesWhere!: (hostKV: Array<any>, objectKV:Array<any>, additionalKV: Array<any>) => void
  @settings.Getter public quicksave!: boolean

  showValue : boolean = false
  changedValue: Array<string>|undefined
  selectedValues!: Array<string|boolean>
  tooltipChanges!: object
  // selectedValuesOriginal!: Array<string|boolean>
  isOrigin: boolean = true
  visibleValueBool!: boolean
  visibleValueBoolIndeterminate!: boolean

  created () {
    this.initSelection()
  }

  initSelection () {
    // console.log('init selection with changes', this.selectedValues)
    const originalValue = JSON.parse(JSON.stringify(this.selectedValuesOriginal))
    // console.log('init selection with changes', originalValue)
    if (this.selectionClients.length > 0) {
      this.selectedValues = this.getValuesWithChanges(originalValue, this.selectionClients, 'clientId')
      this.tooltipChanges = this.updateChangesForTooltip(this.selectionClients, 'clientId')
    } else {
      this.selectedValues = this.getValuesWithChanges(originalValue, this.selectionDepots, 'depotId')
      this.tooltipChanges = this.updateChangesForTooltip(this.selectionDepots, 'depotId')
    }
    // console.log('init selection with changes selectedValues', this.selectedValues)
  }

  @Watch('showValue', { deep: true }) showValuesChanged () { if (!this.showValue) { this.rowItem._showDetails = this.showValue } }

  @Watch('selectedValues', { deep: true }) async selectedValuesChanged () {
    // console.log('-------------ProductPropertyValue changeValue ', this.selectedValues)
    // if (!arrayEqual(this.selectedValues, this.selectedValuesOriginal)) {
    //   this.$emit('change', this.rowItem.propertyId, this.selectedValues, this.selectedValuesOriginal)
    // }
    await this.$emit('change', this.rowItem.propertyId, this.selectedValues, this.selectedValuesOriginal)
    if (this.quicksave) { this.initSelection() }
    // this.isOrigin = arrayEqual(this.selectedValues, this.selectedValuesOriginal)
    // console.log('-------------ProductPropertyValue selectedValues ', this.selectedValues)
    // console.log('-------------ProductPropertyValue selectedValuesOrigin ', this.selectedValuesOriginal)
    // console.log('-------------ProductPropertyValue isOrigin ', this.isOrigin)
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

  get username () {
    return localStorage.getItem('username')
  }

  get allOptionsUnique () {
    const options = this.uniques([...this.rowItem.allValues, this.rowItem.newValue, ...this.rowItem.newValues || []])
    if (this.selectedValuesOriginal.includes(this.$t('values.mixed') as string)) {
      options.push(this.$t('values.mixed') as string)
    }
    return options.filter(val => val !== null && val !== undefined)
    // if (options.includes(null) && options.includes('')) {
    //   options.splice(options.indexOf(''), 1)
    // }
    // return options
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
    const depotValues = Object.values(this.rowItem.depots) || []
    // console.log(JSON.stringify(depotValues), depotValues.length, depotValues.every(v => v === depotValues[0]))
    if ((depotValues.length > 0) && depotValues.every(v => arrayEqual(v, depotValues[0]))) {
      return depotValues[0]
    } else if (depotValues.length > 0 && depotValues.some(v => !arrayEqual(v, depotValues[0]))) {
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

  uniques (arr:Array<any>) { return [...new Set(arr)] }

  handleBoolChange () {
    this.selectedValues = JSON.parse(JSON.stringify([!this.selectedValues[0]]))
    // this.selectedValues = [!this.selectedValues[0]]
    this.selectedValuesChanged()
  }

  selectionChanged (values: Array<string|boolean>, reset: boolean = false) {
    // console.log('selectionChanged PPValue ', values, reset)
    if (reset !== true) {
      // console.log('not reseting - overwrite PPValue ', values, reset)
      this.selectedValues = JSON.parse(JSON.stringify(values))
      this.selectedValuesChanged()
      this.initSelection()
      return
    }

    const hostKey = (this.selectionClients.length > 0) ? 'clientId' : 'depotId'
    const hostValues = (this.selectionClients.length > 0) ? this.selectionClients : this.selectionDepots
    this.deleteFromChangesWhere(
      [hostKey, hostValues],
      ['productId', this.rowItem.productId],
      ['property', this.rowItem.propertyId]
    )
    this.isOrigin = true
    this.initSelection()
  }

  updateChangesForTooltip (selectionHosts: Array<string>, key: string) {
    const originalValue = JSON.parse(JSON.stringify(this.selectedValuesOriginal))
    const changes = {}
    let changesList = this.changesProducts.filter(e => e.property === this.rowItem.propertyId)
    changesList = changesList.filter(e => e.user === this.username)
    changesList = changesList.filter(e => selectionHosts.includes(e[key]))
    if (changesList.length > 0) {
      // save selection if any host has different value in changes as original
      changesList.forEach((e) => {
        if (arrayEqual(e.propertyValue, originalValue)) { return } // everything ok

        // value != originalValue
        if (selectionHosts.length > 1) { // at least one host has different value
          changes[e[key]] = e.propertyValue
        }
      })
    }
    return changes
  }

  getValuesWithChanges (originalValue:Array<any>, selectionHosts: Array<string>, key: string) {
    // console.log('update selectionValues with changes')
    let newValue
    let changesList = this.changesProducts.filter(e => e.property === this.rowItem.propertyId)
    changesList = changesList.filter(e => e.user === this.username)
    changesList = changesList.filter(e => selectionHosts.includes(e[key]))
    // get changes for property and user and selected hosts (depot or client)
    if (changesList.length > 0) {
      let anyValuesDifferent = false
      // overwrite selection if any host has different value in changes as original
      changesList.forEach((e) => {
        if (arrayEqual(e.propertyValue, originalValue)) { return } // everything ok

        // value != originalValue
        if (selectionHosts.length === 1) { // it is only one host, so show changedValue
          newValue = e.propertyValue
        } else { // at least one host has different value
          anyValuesDifferent = true
        }

        // break up if any is different
        if (anyValuesDifferent) {
          this.isOrigin = false
          return [this.$t('values.mixed') as string]
        }
      })
    }
    if (newValue) {
      this.isOrigin = false
      // console.log('update selectionValues with changes - return newValue', newValue)
      return newValue
    }
    this.isOrigin = true
    if (this.selectedValues && Object.values(this.selectedValues).length >= 0) {
      this.isOrigin = arrayEqual(Object.values(this.selectedValues || {}), originalValue)
    }
    // console.log('update selectionValues with changes - return original', originalValue)
    // console.log('----- selectedValues', Object.values(this.selectedValues || {}))
    // console.log('----- originalValue', originalValue)
    // console.log('----- newValue', newValue)
    // console.log('----- selectedValuesOriginal', this.selectedValuesOriginal)
    return originalValue
  }
}
</script>

<style>
.dropdown {
  max-width: -moz-available;
  max-width: -moz-available;          /* For Mozzila */
  max-width: -webkit-fill-available;  /* For Chrome */
}
.TCProductPropertyValue_ValueBool {
  display:inline-block !important;
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
