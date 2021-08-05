<template>
  <div>
    <div v-if="$mq=='mobile'">
      <!-- Depots: {{selectionDepots}} -->
      <b-alert show variant="secondary">
        <small>{{ $t('table.fields.clientsIds') }}: {{ selectionClients.length }}</small>
      </b-alert>
    </div>
    <!-- <DropdownDDDefault
      v-if="selectionDepots.length>1"
      :options="['all depots', ...selectionDepots]"
      :selected-items="['all depots']"
    /> -->
    <TableTDefault
      v-if="properties"
      :is-busy="isLoading"
      :stacked="false"
      :small="true"
      :tableitems="Object.values(properties)"
      :tablefields="fields"
    >
      <template #cell(propertyId)="row">
        {{ row.item.propertyId }}
      </template>
      <template #cell(value)="row">
        <b-row>
          <div
            v-if="Object.keys(fetchedDataClients2Depots).length > 0"
          >
            <!-- {{ createNewPropertyValueEntryRow(row.item) }} -->
            <TableCellTCProductPropertyValue
              :clients2depots="fetchedDataClients2Depots"
              :row-item="row.item"
              @change="handleChange"
            />
          </div>
          <b-button
            v-if="row.item.editable"
            @click="row.toggleDetails()"
          >
            <!-- disabled -->
            +
          </b-button>
        </b-row>
      </template>
      <template #row-details="row">
        <b-card>
          <b-container>
            <b-input-group>
              <b-form-input
                v-model="row.item.newValue"
                size="sm"
                class="TableProductsDetails_EditableProdProp_AddValue_BVFormIInput"
                @keyup.enter="updateNewPropertyValuesRow(row)"
              />
              <template #append>
                <b-button
                  size="sm"
                  variant="outline-secondary"
                  @click="updateNewPropertyValuesRow(row)"
                >
                  {{ $t('values.add') }}
                </b-button>
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
import { IProperties, INewPropertyValue } from '~/types/ttable'
const selections = namespace('selections')

@Component
export default class TProductProperties extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) properties!: IProperties
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  result:Object = {}
  isLoading: boolean = false
  newValuesPerProp: INewPropertyValue = {}
  fetchedDataClients2Depots: object = {}

  get fields () {
    return [
      { label: 'pId', key: 'propertyId', thStyle: { display: 'none' } },
      { label: 'pValue', key: 'value', thStyle: { display: 'none' } }
    ]
  }

  async beforeMount () {
    this.setSelectionClients(['anna-tp-t14.uib.local', 'anna-vm-24001.uib.local'])
    if (this.selectionClients.length > 0) {
      this.fetchedDataClients2Depots = (await this.$axios.$post(
        '/api/opsidata/clients/depots',
        JSON.stringify({ selectedClients: this.selectionClients })
      )).result
    }
  }

  handleChange (propertyId:string, values: Array<string|boolean> /* , type:'UnicodeProductProperty'|'BoolProductProperty' */) {
    // TODO: TODO: Backend-Request setProductProperty
    const data = {
      selectionClients: this.selectionClients,
      productId: this.id,
      propertyId,
      values
      // type
    }
    // eslint-disable-next-line no-console
    console.debug('(todo) Request following data: ', data)
    // this.fetchedData = (await this.$axios.$post(
    //   '/api/opsidata/product/properties/value',
    //   JSON.stringify(this.tableData)
    // )).result
  }

  updateNewPropertyValuesRow (row: INewPropertyValue) {
    row.item.newValues.push(row.item.newValue)
  }
}
</script>

<style>

</style>
