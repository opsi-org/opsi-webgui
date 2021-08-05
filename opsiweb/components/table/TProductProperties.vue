<template>
  <div>
    <div v-if="$mq=='mobile'">
    <!-- Depots: {{selectionDepots}} -->
    Clients ({{selectionClients.length}}): {{JSON.stringify(selectionClients)}}
    </div>
    <!-- <DropdownDDDefault
      v-if="selectionDepots.length>1"
      :options="['all depots', ...selectionDepots]"
      :selected-items="['all depots']"
    /> -->
    <TableTDefault v-if="properties" :is-busy="isLoading" :stacked="false" :small="true" :tableitems="Object.values(properties)" :tablefields="fields">
      <template #cell(propertyId)="row">
        {{ row.item.propertyId }}
      </template>
      <template #cell(value)="row">
        <!-- Clients: {{row.item.clientsValues}} -->
        <b-row>
          <div
            v-if="Object.keys(fetchedDataClients2Depots).length > 0"
          >
            {{createNewPropertyValueEntryRow(row.item)}}
            <!-- {{createNewPropertyValueEntry(row.item.propertyId)}} -->
            <TableCellTCProductPropertyValue
              :clients2depots="fetchedDataClients2Depots"
              :row-item="row.item"
            />
            <!-- :values-new="row.item.newValues" -->
            <!-- :values-new="newValuesPerProp[row.item.propertyId].newValues" -->
            <!-- :values-new="getNewPropertyValues(row.item.propertyId)" -->
          </div>
          <b-button
            v-if="row.item.editable"
            disabled
            @click="row.toggleDetails()"
          >
            +
          </b-button>
        </b-row>
      </template>
      <template #row-details="row">
        <b-card>
          <b-container>
            <b-input-group>
              <!-- @keydown.native="addNewValOnEnter(rows.item)" -->
                <!-- :placeholder="$t('products.config.formInputPlaceholder')" -->
                <!-- :placeholder="newValue" -->
              <!-- {{newValuesPerProp}} -->
              <!-- {{newValuesPerProp[row.item.propertyId].newValues}}
              {{newValuesPerProp[row.item.propertyId].newValue}} -->
              <!-- {{row.item.newValue}}
              {{row.item.newValues}} -->
                <!-- v-model="newValuesPerProp[row.item.propertyId].newValue" -->
              <b-form-input
                v-model="row.item.newValue"
                size="sm"
                class="TableProductsDetails_EditableProdProp_AddValue_BVFormIInput"
                disabled
                @keyup.enter="updateNewPropertyValuesRow(row.item)"
              />
                <!-- @keyup.enter="updateNewPropertyValuesRow(row.item)" -->
              <template #append>
                <!-- v-b-tooltip.hover.left
                  v-bind:title="$t('products.config.addValue')" -->
                <b-button
                  disabled
                  size="sm"
                  variant="outline-secondary"
                  @click="updateNewPropertyValuesRow(row.item)"
                >
                  +
                </b-button>
                <!-- @click="newValuesPerProp[row.propertyId].push(newValue)" -->
              </template>
            </b-input-group>
          </b-container>
        </b-card>

      </template>
    </TableTDefault>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IProperties, INewPropertyValue, IProperty } from '~/types/ttable'
// import { INewPropertyValue } from '~/types/tsettings'
const selections = namespace('selections')

interface Request {
    hosts: Array<string>
}

@Component
export default class TProductProperties extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) properties!: IProperties
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  result:Object = {}
  request: Request = { hosts: [] }
  isLoading: boolean = false
  newValuesPerProp: INewPropertyValue = {}
  fetchedDataClients2Depots: object = {}

  get fields () {
    return [
      { label: 'pId', key: 'propertyId', thStyle: { display: 'none' } },
      { label: 'pValue', key: 'value', thStyle: { display: 'none' } }
    ]
  }

  // selectedValue (propertyId: string) {

  //   return 'x'
  // }
  // @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  async beforeMount () {
    // this.$fetch()

    // this.setSelectionClients(['anna-tp-t14.uib.local'])
    this.setSelectionClients(['anna-tp-t14.uib.local', 'anna-vm-24001.uib.local'])
    if (this.selectionClients.length > 0) {
      this.fetchedDataClients2Depots = (await this.$axios.$post(
        '/api/opsidata/clients/depots',
        JSON.stringify({ selectedClients: this.selectionClients })
      )).result
    }
  }

  // createNewPropertyValueEntry (propId:string) {
  //   this.newValuesPerProp[propId] = {
  //     newValue: propId,
  //     newValues: []
  //   }
  // }

  createNewPropertyValueEntryRow (rowitem: IProperty) {
    // rowitem.newValue = rowitem.propertyId
    rowitem.newValue = '<add new value>'
    rowitem.newValues = []
  }

  // getNewPropertyValues (propId:string): Array<string> {
  //   if (this.newValuesPerProp[propId]) {
  //     console.debug('get new value: ', this.newValuesPerProp[propId].newValues)
  //     return this.newValuesPerProp[propId].newValues
  //   }
  //   console.debug('get new value: [x]')
  //   return ['x']
  // }

  updateNewPropertyValuesRow (rowitem:IProperty) {
    if (rowitem.newValue) {
      if (rowitem.newValues === undefined) {
        rowitem.newValues = []
      }
      rowitem.newValues.push(rowitem.newValue)
      // rowitem.possibleValues.push(rowitem.newValue)
      // rowitem.clientsValues.push(rowitem.newValue)
      // rowitem.newValues.push(rowitem.newValue)
    }
    console.debug('add new value', rowitem.newValue)
    console.debug('   new values', rowitem.newValues)
  }
  //   console.log('current values:', rowitem.newValues)
  //   console.log('Add new value:', rowitem.newValue)
  //   if (rowitem.newValues === undefined) {
  //     rowitem.newValues = []
  //   }
  //   if (rowitem.newValue === undefined) {
  //     rowitem.newValue = ''
  //   }
  //   rowitem.newValues.push(rowitem.newValue)
  //   console.log('new values:', rowitem.newValues)
  //   // this.newValuesPerProp = Object.assign({}, this.newValuesPerProp) as INewPropertyValue
  //   // this.newValuesPerProp[propId].newValues = [...this.newValuesPerProp[propId].newValues]
  //   // this.newValuesPerProp = Object.assign({}, this.newValuesPerProp, { propID: { newValues: [...this.newValuesPerProp[propId].newValues] } }) as INewPropertyValue
  //   rowitem.newValues = Object.assign([], rowitem.newValues)
  //   // console.log('new values:', this.newValuesPerProp[propId])
  // }

  // updateNewPropertyValues (propId:string) {
  //   console.log('Add new value:', this.newValuesPerProp[propId].newValue)
  //   this.newValuesPerProp[propId].newValues.push(this.newValuesPerProp[propId].newValue)
  //   console.log('new values:', this.newValuesPerProp[propId].newValues)
  //   // this.newValuesPerProp = Object.assign({}, this.newValuesPerProp) as INewPropertyValue
  //   this.newValuesPerProp[propId].newValues = [...this.newValuesPerProp[propId].newValues]
  //   // this.newValuesPerProp = Object.assign({}, this.newValuesPerProp, { propID: { newValues: [...this.newValuesPerProp[propId].newValues] } }) as INewPropertyValue
  //   console.log('new values:', this.newValuesPerProp[propId])
  // }

  // async fetch () {
  //   if (this.id) {
  //     this.isLoading = true
  //     this.request.hosts = [this.id]
  //     this.result = (await this.$axios.$post(
  //       '/api/opsidata/hosts', JSON.stringify(this.request)
  //     )).result
  //     this.isLoading = false
  //   }
  // }
}
</script>

<style>

</style>
