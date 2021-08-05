<template>
  <div>
    <!-- Depots: {{rowItem.depotsValues}} <br /> -->
    <!-- {{selectionClientsValuesWithDepotValues}} <br /> -->
    <b-form-checkbox
      v-if="rowItem.propertyType=='BoolProductProperty'"
      v-model="visibleValueBool"
      disabled
      :indeterminate="visibleValueBoolIndeterminate"
    />

    <DropdownDDDefault
      v-else-if="rowItem.propertyType=='UnicodeProductProperty' && rowItem.multiValue"
      :options="uniqueOptions"
      :selected-items="uniqueSelection"
      :multiple="true"
      disabled
    />
    <DropdownDDDefault
      v-else
      :options="uniqueOptions"
      :selected-items="uniqueSelection"
      disabled
    />
    <!-- {{rowItem.newValues}} -->
    <!-- {{(rowItem.propertyType=='UnicodeProductProperty') ? visibleValueUnicode: ''}} -->

    <!-- <b-form-input v-model="row.item.clientsValues" size="sm" readonly /> -->
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IProperty } from '~/types/ttable'
import { IObjectString2String } from '~/types/tsettings'
import { arrayEqual } from '~/helpers/hcompares'
const selections = namespace('selections')

@Component
export default class TProductProperties extends Vue {
  @Prop() type!: 'unicode'|'bool'|'functional'
  @Prop() rowItem!: IProperty
  @Prop() clients2depots!: IObjectString2String
  @Prop({ default: () => { return [] } }) valuesNew!: Array<string>
  // @selections.Getter public selectionDepots!: Array<string>
  // @selections.Getter public selectionProducts!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  // @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void

  // @Watch('valuesNew') newValuedAdded () {
  //   this.selectionHandler(this.selections)
  // }

  // @Watch('rowItem.newValues') newValuesChanged () {
  //   if (this.visibleValueUnicode === ['mixed']) {

  //   }
  // }

  get uniqueSelection () {
    if (this.rowItem.newValues) {
      if (this.visibleValueUnicode !== ['mixed']) {
        return this.uniques([...this.visibleValueUnicode, ...this.rowItem.newValues])
      }
      return this.uniques([...this.rowItem.newValues])
    }
    return this.uniques([...this.visibleValueUnicode])
  }

  get uniqueOptions () {
    if (this.rowItem.newValues) {
      return this.uniques([...this.rowItem.possibleValues, ...this.visibleValueUnicode, ...this.rowItem.newValues])
    }
    return this.uniques([...this.rowItem.possibleValues, ...this.visibleValueUnicode, ...this.valuesNew])
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
          valuesWithDepotDefaults.push(this.rowItem.clientsValues[i])// + '-' +client)
        } else {
          const clientDepot = this.clients2depots[client]
          if (this.rowItem.depotsIds.includes(clientDepot)) {
            const i = this.rowItem.depotsIds.indexOf(clientDepot)
            valuesWithDepotDefaults.push(this.rowItem.depotsValues[i])// + '-' +clientDepot)
          }
        }
      }
    }
    return valuesWithDepotDefaults
  }

  get visibleValueBool () {
    if (this.selectionClientsValuesWithDepotValues.every(arrv => arrv[0] === true)) { return true }
    if (this.selectionClientsValuesWithDepotValues.every(arrv => arrv[0] === false)) { return false }
    return false // or true ---> this case is modelled by indeterminate
  }
  // set visibleValueBool (val:boolean) {
  //   // TODO: post request with update prodPropState/s
  // }

  get visibleValueBoolIndeterminate () {
    // check for if checkbox "mixed"/indeterminate
    return !this.selectionClientsValuesWithDepotValues.every(arrv => arrv[0] === true) && !this.selectionClientsValuesWithDepotValues.every(arrv => arrv[0] === false)
  }

  get visibleValueUnicode () {
    if (this.selectionClientsValuesWithDepotValues.every(arrv => arrayEqual(arrv, this.selectionClientsValuesWithDepotValues[0]))) {
      return this.selectionClientsValuesWithDepotValues[0]
    }
    return ['mixed']
  }

  uniques (arr:Array<any>) {
    return [...new Set(arr)]
  }
  // set visibleValueUnicode (val) {
  //   // TODO: post request with update prodPropState/s
  // }
}
</script>

<style>

</style>
