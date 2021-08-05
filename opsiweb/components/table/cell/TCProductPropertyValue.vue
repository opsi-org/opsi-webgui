<template>
  <div>
    <b-form-checkbox
      v-if="rowItem.propertyType=='BoolProductProperty'"
      v-model="visibleValueBool"
      :indeterminate="visibleValueBoolIndeterminate"
    />

    <DropdownDDDefault
      v-else-if="rowItem.propertyType=='UnicodeProductProperty' && rowItem.multiValue"
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
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { IProperty } from '~/types/ttable'
import { IObjectString2String } from '~/types/tsettings'
import { arrayEqual } from '~/helpers/hcompares'
const selections = namespace('selections')
const mixed = '<mixed>'
@Component
export default class TProductProperties extends Vue {
  @Prop() type!: 'unicode'|'bool'|'functional'
  @Prop() rowItem!: IProperty
  @Prop() clients2depots!: IObjectString2String
  @Prop({ default: () => { return [] } }) valuesNew!: Array<string>
  @selections.Getter public selectionClients!: Array<string>

  @Watch('rowItem.newValues') newValuesChanged () {
    this.$emit('change', this.rowItem.propertyId, this.uniqueSelection, 'UnicodeProductProperty')
  }

  selectionChanged (value: Array<string>) {
    this.$emit('change', this.rowItem.propertyId, value, 'UnicodeProductProperty')
  }

  set visibleValueBool (val:boolean) {
    this.$emit('change', this.rowItem.propertyId, [val], 'BoolProductProperty')
  }

  get uniqueSelection () {
    if (this.rowItem.newValues && this.rowItem.newValues.length > 0) {
      if (this.visibleValueUnicode.includes(mixed)) {
        return this.uniques([...this.rowItem.newValues])
      }
      return this.uniques([...this.visibleValueUnicode, ...this.rowItem.newValues])
    }
    return this.uniques([...this.visibleValueUnicode])
  }

  get uniqueOptions () {
    if (this.rowItem.newValues) {
      return this.uniques([...this.rowItem.possibleValues, ...this.visibleValueUnicode, ...this.rowItem.newValues])
    }
    return this.uniques([...this.rowItem.possibleValues, ...this.visibleValueUnicode])
  }

  get selectionClientsValuesWithDepotValues () {
    let valuesWithDepotDefaults = []
    if (this.selectionClients.length === this.rowItem.clientsIds.length) {
      valuesWithDepotDefaults = [...this.rowItem.clientsValues]
    } else {
      for (const ci in this.selectionClients) {
        const client = this.selectionClients[ci]
        if (this.rowItem.clientsIds.includes(client)) {
          const i = this.rowItem.clientsIds.indexOf(client)
          valuesWithDepotDefaults.push(this.rowItem.clientsValues[i])
        } else {
          const clientDepot = this.clients2depots[client]
          if (this.rowItem.depotsIds.includes(clientDepot)) {
            const i = this.rowItem.depotsIds.indexOf(clientDepot)
            valuesWithDepotDefaults.push(this.rowItem.depotsValues[i])
          }
        }
      }
    }
    return valuesWithDepotDefaults
  }

  get visibleValueBool () {
    if (this.selectionClientsValuesWithDepotValues.every(arrv => arrv[0] === true)) { return true }
    if (this.selectionClientsValuesWithDepotValues.every(arrv => arrv[0] === false)) { return false }
    return false // or true ---> doesnt matter: if 'mixed'(this case) indeterminate should be true
  }

  get visibleValueBoolIndeterminate () {
    // check for if checkbox "mixed"/indeterminate
    return !this.selectionClientsValuesWithDepotValues.every(arrv => arrv[0] === true) && !this.selectionClientsValuesWithDepotValues.every(arrv => arrv[0] === false)
  }

  get visibleValueUnicode () {
    if (this.selectionClientsValuesWithDepotValues.every(arrv => arrayEqual(arrv, this.selectionClientsValuesWithDepotValues[0]))) {
      return this.selectionClientsValuesWithDepotValues[0]
    }
    return [mixed]
  }

  uniques (arr:Array<any>) {
    return [...new Set(arr)]
  }
}
</script>

<style>

</style>
