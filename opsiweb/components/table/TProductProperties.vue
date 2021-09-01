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
    <TableTTable
      v-if="properties"
      :is-busy="isLoading"
      :stacked="false"
      :small="true"
      :items="properties"
      :fields="fields"
    >
      <template #cell(propertyId)="row">
        {{ row.item.propertyId }}
      </template>
      <template #cell(value)="row">
        <b-row>
          <div
            v-if="Object.keys(fetchedDataClients2Depots).length > 0"
          >
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
    </TableTTable>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { INewPropertyValue, IProperty } from '~/types/ttable'
const selections = namespace('selections')

@Component
export default class TProductProperties extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) properties!: Array<IProperty>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  errorText: string = ''
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
    // this.setSelectionClients(['anna-tp-t14.uib.local', 'anna-vm-24001.uib.local'])
    if (this.selectionClients.length > 0) {
      // const params = { selectedClients: this.selectionClients }
      // await this.$axios.$get(`/api/opsidata/clients/depots?selectedClients=${this.selectionClients}`)
      await this.$axios.$get(`/api/opsidata/clients/depots?selectedClients=${this.selectionClients}`)
        .then((response) => {
          this.fetchedDataClients2Depots = response.result
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          this.errorText = (this as any).$t('message.errortext')
        })
    }
  }

  handleChange (propertyId:string, values: Array<string|boolean> /* , type:'UnicodeProductProperty'|'BoolProductProperty' */) {
    // TODO: TODO: Backend-Request setProductProperty
    const data = {
      selectionClients: this.selectionClients,
      propertyId,
      values
    }
    // eslint-disable-next-line no-console
    console.debug('(todo) Request POST product property: ', data)
    // this.fetchedData = (await this.$axios.$post(
    //   '/api/opsidata/product/${this.id}/properties',
    //   JSON.stringify(this.data)
    // )).result
  }

  updateNewPropertyValuesRow (row: INewPropertyValue) {
    row.item.newValues.push(row.item.newValue)
  }
}
</script>

<style>

</style>
