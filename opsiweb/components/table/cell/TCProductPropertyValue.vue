<template>
  <b-form-row class="TCProductPropertyValue_Container justify-content-md-center">
    <b-col
      class="TCProductPropertyValue_Value"
      :class="{'d-none' : rowItem.propertyId.includes('password') && !showValue}"
      @click.middle="() => { (rowItem.editable) ? rowItem.newValue = `${changedValue || visibleValue}`:'' } "
    >
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
      <!-- @click.middle="rowItem.newValue = `${changedValue || visibleValue}`" -->
      <!-- @contextmenu.prevent="() => { (rowItem.editable) ? rowItem.newValue = `${changedValue || visibleValue}`:'' } " -->
      <DropdownDDDefault
        v-else
        :options="uniqueOptions"
        :selected-items="uniqueSelection"
        @change="selectionChanged"
      />
      <!-- @click.middle="rowItem.newValue = `${changedValue || visibleValue}`" -->
      <!-- @contextmenu.prevent="() => { (rowItem.editable) ? rowItem.newValue = `${changedValue || visibleValue}`:'' } " -->
      <b-icon-table v-if="showTooltip" :id="`DDProductProperty_value_hover_${rowItem.propertyId}`" class="right" />
      <TooltipTTProductCell
        v-if="showTooltip"
        type="property"
        :target="`DDProductProperty_value_hover_${rowItem.propertyId}`"
        :details="rowItem.clients"
      />
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
  </b-form-row>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { IProperty } from '~/types/ttable'
import { IObjectString2String } from '~/types/tsettings'
import { arrEqual } from '~/helpers/equal'
// import { arrayEqual } from '~/helpers/hcompares'
// import { arrayEqual } from '~/helpers/hcompares'
const selections = namespace('selections')
// const mixed = '<mixed>'
@Component
export default class TProductPropertyValue extends Vue {
  // @Prop() type!: 'unicode'|'bool'|'functional'
  @Prop() rowItem!: IProperty
  @Prop() clients2depots!: IObjectString2String
  @Prop({ default: () => { return [] } }) valuesNew!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  visibleValueBoolIndeterminate: boolean = false
  showValue : boolean = false
  changedValue: Array<string>|undefined

  @Watch('showValue', { deep: true }) showValuesChanged () {
    if (!this.showValue) {
      this.rowItem._showDetails = this.showValue
    }
  }

  @Watch('visibleValue', { deep: true }) boolValuesChanged () {
    if (this.rowItem.type === 'BoolProductProperty') {
      this.$emit('change', this.rowItem.propertyId, this.visibleValue) //, 'BoolProductPropery')
    }
  }

  @Watch('rowItem.newValues', { deep: true }) newValuesChanged (newValue:any, oldValue:any) {
    if (this.rowItem.newValues === undefined || this.rowItem.newValues.length === 0) { return }
    if (arrEqual(newValue, oldValue)) { return }
    // console.debug('newValues changed', newValue, oldValue)

    this.$emit('change', this.rowItem.propertyId, this.uniqueSelection) //, 'UnicodeProductProperty')
  }

  selectionChanged (value: Array<string>) {
    // if (value)
    // const index = value.indexOf(this.$t('values.mixed') as string)
    // if (index > -1) {
    //   value.splice(index, 1)
    // }
    this.changedValue = value
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
    // console.debug('unique selection ', this.rowItem.editable, this.rowItem.newValues, this.rowItem.newValues?.length)
    if (this.rowItem.editable && this.rowItem.newValues && this.rowItem.newValues.length > 0) {
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
    const c:Array<string> = this.uniques([...this.visibleValue])
    // console.debug('uniqueSelection', c)
    return c
  }

  get uniqueOptions () {
    if (this.rowItem.newValues) {
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
  test () {
    alert('me')
  }

  get visibleValue () {
    if (this.selectionClients.length !== Object.keys(this.rowItem.clients).length) {
      if (Object.keys(this.rowItem.clients).length > 0 && Object.keys(this.rowItem.clients)[0] !== '') {
        console.warn('waiting for new data...')
        // return ['not ready?']
        // throw new Error(`something went wrong. SelectionClient.length !== keys(rowItem.clients).length ${JSON.stringify(this.rowItem)}`)
      }
    }

    if (this.rowItem.type === 'BoolProductProperty') {
      this.visibleValueBoolIndeterminate = false
    }
    if (this.rowItem.allClientValuesEqual) {
      let ret
      if (this.rowItem.clients && Object.keys(this.rowItem.clients).length > 0 && Object.keys(this.rowItem.clients)[0] !== '') {
        ret = Object.values(this.rowItem.clients)[0]
      } else if (this.rowItem.depots && Object.keys(this.rowItem.depots).length > 0 && Object.keys(this.rowItem.depots)[0] !== '') {
        ret = Object.values(this.rowItem.depots)[0]
      } else if (this.rowItem.default) {
        ret = this.rowItem.default
      } else {
        throw new Error('No client or depot values found')
      }
      if (this.rowItem.editable && this.rowItem.newValues && this.rowItem.newValues.length > 0) {
        ret = this.rowItem.newValues[0]
      }
      return ret
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
// .TCProductPropertyValue_Container {
//   max-width: 100%;
//   display: inline-block;
// }
// .TCProductPropertyValue_Value {
//   max-width: fit-content;
// }
// .TCProductPropertyValue_ShowBtn,
// .TCProductPropertyValue_Value > .dropdown,
// .TCProductPropertyValue_Value > .btn{
//   display: inline-block;
// }
// /* .TCProductPropertyValue_Container > div {
//   max-width: max-content;
//   display: inline-block;
// } */
// .dropdown {
//   max-width: 50%;
// }
</script>

<style>
.dropdown {
  max-width: -moz-available;
  max-width: -moz-available;          /* For Mozzila */
  max-width: -webkit-fill-available;  /* For Chrome */
  /*max-width: stretch;*/                 /* Unprefixed */
}
/* .TCProductPropertyValue_Value { */
  /* max-width: 80% !important; */
/* } */
.TCProductPropertyValue_Value .dropdown > .dropdown-menu,
.TCProductPropertyValue_Value .dropdown > .dropdown-menu .dropdown-item {
/* z-index: inherit; */
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
}
.TCProductPropertyValue_Value .dropdown button {
  /* max-width: 100%; */
  text-overflow: ellipsis;
  overflow: hidden;
}
.btn-group, .btn-group-vertical {
  display: grid !important;
}
</style>
