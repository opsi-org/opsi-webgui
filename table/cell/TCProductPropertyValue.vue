<template>
  <div>
    <b-form-checkbox
      v-if="rowItem.type=='BoolProductProperty'"
      v-model="visibleValue[0]"
      :indeterminate="visibleValueBoolIndeterminate"
      style="display:inline"
    />

    <DropdownDDDefault
      v-else-if="rowItem.type=='UnicodeProductProperty' && rowItem.multiValue"
      :options="uniqueOptions"
      :selected-items="uniqueSelection"
      :multiple="true"
      @change="selectionChanged"
    />
    <DropdownDDDefault
      v-else
      :options="uniqueOptions"
      :selected-items="uniqueSelection"
      @change="selectionChanged"
    />
    <slot name="editable-button" />
    <b-icon-table v-if="showTooltip" :id="`DDProductProperty_value_hover_${rowItem.propertyId}`" class="right" />
    <TooltipTTProductCell
      v-if="showTooltip"
      type="property"
      :target="`DDProductProperty_value_hover_${rowItem.propertyId}`"
      :details="rowItem.clients"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { IProperty } from '~/types/ttable'
import { IObjectString2String } from '~/types/tsettings'
// import { arrayEqual } from '~/helpers/hcompares'
// import { arrayEqual } from '~/helpers/hcompares'
const selections = namespace('selections')
// const mixed = '<mixed>'
@Component
export default class TProductProperties extends Vue {
  // @Prop() type!: 'unicode'|'bool'|'functional'
  @Prop() rowItem!: IProperty
  @Prop() clients2depots!: IObjectString2String
  @Prop({ default: () => { return [] } }) valuesNew!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  visibleValueBoolIndeterminate: boolean = false

  @Watch('visibleValue', { deep: true }) boolValuesChanged () {
    if (this.rowItem.type === 'BoolProductProperty') {
      this.$emit('change', this.rowItem.propertyId, this.visibleValue) //, 'BoolProductPropery')
    }
  }

  @Watch('rowItem.newValues') newValuesChanged () {
    this.$emit('change', this.rowItem.propertyId, this.uniqueSelection) //, 'UnicodeProductProperty')
  }

  selectionChanged (value: Array<string>) {
    // if (value)
    // const index = value.indexOf(this.$t('values.mixed') as string)
    // if (index > -1) {
    //   value.splice(index, 1)
    // }
    this.$emit('change', this.rowItem.propertyId, value) //, 'UnicodeProductProperty')
  }

  mounted () {
    // if (this.rowItem.length > 1) {
    //   this.onlyOneVersion = false
    // }
  }
  // set visibleValueBool (val:boolean) {
  //   this.$emit('change', this.rowItem.propertyId, [val], 'BoolProductProperty')
  // }

  get showTooltip () {
    if (this.rowItem.type === 'UnicodeProductProperty') {
      return this.uniqueSelection.includes(this.$t('values.mixed'))
    }
    if (this.rowItem.type === 'BoolProductProperty') {
      return this.visibleValueBoolIndeterminate
    }
    return true
  }

  get uniqueSelection () {
    if (this.rowItem.newValues && this.rowItem.newValues.length > 0) {
      if (this.visibleValue.includes(this.$t('values.mixed') as string)) {
        return this.uniques([...this.rowItem.newValues])
      }
      return this.uniques([...this.visibleValue, ...this.rowItem.newValues])
    }
    // else if (this.visibleValue.length > 1 && this.visibleValue.includes(this.$t('values.mixed') as string)) {
    //   const newarr = this.uniques([...this.visibleValue])
    //   const index = newarr.indexOf(this.$t('values.mixed') as string)
    //   if (index > -1) {
    //     newarr.splice(index, 1)
    //   }
    //   return newarr
    // }
    return this.uniques([...this.visibleValue])
  }

  get uniqueOptions () {
    console.debug('allValues', this.rowItem.allValues)
    console.debug('visible', this.visibleValue)
    if (this.rowItem.newValues) {
      console.debug('new', this.rowItem.newValues)
      return this.uniques([...Object.values(this.rowItem.allValues), ...this.visibleValue, ...this.rowItem.newValues])
    }
    return this.uniques([...Object.values(this.rowItem.allValues), ...this.visibleValue])
  }

  // get selectionClientsValuesWithDepotValues () {
  // let valuesWithDepotDefaults = []
  // if (this.selectionClients.length === this.rowItem.clientsIds.length) {
  //   valuesWithDepotDefaults = [...this.rowItem.clientsValues]
  // } else {
  //   for (const ci in this.selectionClients) {
  //     const client = this.selectionClients[ci]
  //     if (this.rowItem.clientsIds.includes(client)) {
  //       const i = this.rowItem.clientsIds.indexOf(client)
  //       valuesWithDepotDefaults.push(this.rowItem.clientsValues[i])
  //     } else {
  //       const clientDepot = this.clients2depots[client]
  //       if (this.rowItem.depotsIds.includes(clientDepot)) {
  //         const i = this.rowItem.depotsIds.indexOf(clientDepot)
  //         valuesWithDepotDefaults.push(this.rowItem.depotsValues[i])
  //       }
  //     }
  //   }
  // }
  // return valuesWithDepotDefaults
  //   return []
  // }

  get visibleValue () {
    console.debug('selectionClients', this.selectionClients)
    console.debug('rowItem.clients', this.rowItem)
    if (this.selectionClients.length !== Object.keys(this.rowItem.clients).length) {
      throw new Error(`something went wrong. SelectionClient.length !== keys(rowItem.clients).length ${this.rowItem}`)
    }

    if (this.rowItem.type === 'BoolProductProperty') {
      this.visibleValueBoolIndeterminate = false
    }
    if (this.rowItem.allClientValuesEqual) {
      return Object.values(this.rowItem.clients)[0]
    }
    // not all clients are equal
    if (this.rowItem.type === 'BoolProductProperty') {
      this.visibleValueBoolIndeterminate = true
    }
    return [this.$t('values.mixed') as string]

    // const clientValues = Object.values(this.rowItem.clients)
    // if (clientValues.every(arrv => arrayEqual(arrv, clientValues[0]))) { return clientValues[0] }
    // // if (Object.values(this.rowItem.clients).every(arrv => arrv[0] === true)) { return true }
    // // if (Object.values(this.rowItem.clients).every(arrv => arrv[0] === false)) { return false }

    // // return false // or true ---> doesnt matter: if 'mixed'(this case) indeterminate should be true
  }

  // get visibleValueBoolIndeterminate () {
  //   // check for if checkbox "mixed"/indeterminate
  //   return !this.selectionClientsValuesWithDepotValues.every(arrv => arrv[0] === true) && !this.selectionClientsValuesWithDepotValues.every(arrv => arrv[0] === false)
  // }

  // get visibleValue () {
  //   const clientValues = Object.values(this.rowItem.clients)
  //   if (clientValues.every(arrv => arrayEqual(arrv, clientValues[0]))) {
  //     return clientValues[0]
  //   }
  //   return [this.$t('values.mixed') as string]
  // }

  uniques (arr:Array<any>) {
    return [...new Set(arr)]
  }
}
</script>

<style>

</style>
