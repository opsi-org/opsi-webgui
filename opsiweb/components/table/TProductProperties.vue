<template>
  <div>
    <div v-if="$mq=='mobile'">
      <b-alert show variant="secondary">
        <small>{{ $t('table.fields.clientsIds') }}: {{ selectionClients.length }}</small>
      </b-alert>
    </div>
    <div v-else-if="selectionClients.length <= 0">
      <b-alert show variant="warning">
        <small>{{ $t('message.noClientsSelectedShowDepot') }}</small>
      </b-alert>
    </div>
    <!-- <div v-if="$mq=='tablet'">hiii {{$mq}}</div> -->
    <!-- <DropdownDDDefault
      v-if="selectionDepots.length>1"
      :options="['all depots', ...selectionDepots]"
      :selected-items="['all depots']"
    /> -->
    <!-- v-if="properties && Object.values(properties).length > 0" -->
    <TableTTable
      class="TProductProperties_Table"
      :is-busy="isLoading"
      :items="Object.values(properties)"
      :fields="fields"
      :stacked="false"
      :small="true"
      :disable-selection="true"
      show-empty
    >
      <!-- <template #cell(value)="row">
        <b-button @click="row.toggleDetails"></b-button>
      </template> -->

      <template #empty>
        <small>{{ $t('table.emptyText') }}</small>
      </template>
      <template #cell(propertyId)="row">
        <b v-if="row.item.anyClientDifferentFromDepot">{{ row.item.propertyId }}</b>
        {{ (row.item.anyClientDifferentFromDepot)? '': row.item.propertyId }}
        <small v-if="row.item.anyDepotDifferentFromDefault">
          <br>
          (depotValue/s different from default!)
          <!-- TODO: show tooltip with depot- and default-values -->
        </small>
      </template>
      <template #cell(value)="row">
        <b-row>
          <div>
            <TableCellTCProductPropertyValue
              :clients2depots="fetchedDataClients2Depots"
              :row-item="row.item"
              @change="handleChange"
            >
              <template #editable-button>
                <b-button
                  v-if="row.item.editable"
                  variant="primary"
                  size="sm"
                  @click="row.toggleDetails()"
                >
                  +
                </b-button>
              </template>
            </TableCellTCProductPropertyValue>
          </div>
        </b-row>
      </template>
      <template #row-details="row">
        <b-container>
          <b-input-group>
            <b-form-input
              v-model="row.item.newValue"
              size="sm"
              class="TableProductsDetails_EditableProdProp_AddValue_BVFormIInput"
              @keyup.enter="updateNewPropertyValuesRow(row.item)"
            />
            <template #append>
              <b-button
                size="sm"
                variant="outline-secondary"
                @click="updateNewPropertyValuesRow(row.item)"
              >
                {{ $t('values.add') }}
              </b-button>
              <ButtonBTNHelpTooltip :id="`btn_tt_${row.item.propertyId}`" tooltip="middle click on value-dropdown will copy the text" />
            </template>
          </b-input-group>
        </b-container>
      </template>

    </TableTTable>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { INewPropertyValue, IProperties, IProperty } from '~/types/ttable'
const selections = namespace('selections')

@Component
export default class TProductProperties extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) properties!: IProperties
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>

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

  updateNewPropertyValuesRow (rowItem: IProperty) {
    if (rowItem.newValue && rowItem.newValues) {
      rowItem.newValues.push(rowItem.newValue)
    }
  }
}
</script>

<style>
.TProductProperties_Table td[aria-colindex$="1"] {
  min-width: 30%;
}
.TProductProperties_Table td[aria-colindex$="2"] {
  max-width: 70%;
  /* max-width: 100%; */
  /* background-color: blue !important; */
}
.TProductProperties_Table {
  max-width: 100% !important;
}
.TableProductsDetails_EditableProdProp_AddValue_BVFormIInput {
  max-width: calc(100% - 30px);
}
.b-table td > .row,
.b-table td > .row > .row {
  margin: 0px !important;
}
</style>
