<template>
  <div data-testid="TProductProperties">
    <div v-if="!errorText && selectionClients.length <= 0">
      <AlertAAlert show variant="warning">
        <small>{{ $t('message.noClientsSelectedShowDepot') }}</small>
      </AlertAAlert>
    </div>
    <div v-else-if="!errorText && $mq=='mobile'">
      <AlertAAlert show variant="secondary">
        <small>{{ $t('table.fields.clientsIds') }}: {{ selectionClients.length }}</small>
      </AlertAAlert>
    </div>
    <div v-if="!errorText && Object.values(properties.productVersions).filter(n => n).length !== selectionDepots.length">
      <AlertAAlert show variant="warning">
        <small>
          {{ $t('message.notOnEachDepot', {count:Object.values(properties.productVersions).filter(n => n).length, countall:selectionDepots.length}) }}
        </small>
      </AlertAAlert>
    </div>
    <div v-if="!errorText && Object.values(properties.productVersions).filter(n => n).some((v)=>v!=Object.values(properties.productVersions).filter(n => n)[0])">
      <AlertAAlert show variant="warning">
        <small>{{ $t('message.differentProductVersions') }}</small>
      </AlertAAlert>
    </div>
    <p v-if="errorText">
      {{ errorText }}
    </p>
    <TableTBVTable
      class="TProductProperties_Table"
      :is-loading="isLoading"
      :error="errorText"
      :items="Object.values(properties.properties)"
      :fields="fields"
    >
      <template #empty>
        <small>{{ $t('table.emptyText') }}</small>
      </template>
      <template #cell(propertyId)="row">
        <TableCellTCProductPropertyId :row="row" :product-versions="properties.productVersions" />
      </template>
      <template #cell(value)="row">
        <b-row>
          <div>
            <TableCellTCProductPropertyValue
              :clients2depots="fetchedDataClients2Depots"
              :row-item="row.item"
              @change="handleChange"
            />
          </div>
        </b-row>
      </template>
      <template #row-details="row">
        <b-container :class="`TProductProperties_row_details TProductProperties_row_details_${row.item.propertyId}`">
          <!-- <b-input-group v-if="row.item.editable">
            <b-form-input
              v-model="row.item.newValue"
              size="sm"
              aria-label="new property value text"
              class="TableProductsDetails_EditableProdProp_AddValue_BVFormIInput"
              @keyup.enter="updateNewPropertyValuesRow(row.item)"
            />
            <template #append>
              <b-button
                size="sm"
                aria-label="add new property value"
                variant="outline-primary"
                @click="updateNewPropertyValuesRow(row.item)"
              >
                {{ $t('values.add') }}
              </b-button>
              <ButtonBTNHelpTooltip :id="`btn_tt_${row.item.propertyId}`" tooltip="middle click on value-dropdown will copy the text" />
            </template>
          </b-input-group> -->
          <small>
            Defaults: <b v-if="row.item.default!='mixed'">[{{ row.item.details }}]</b>
            <div v-else>
              <p v-for="v,k in row.item.defaultDetails" :key="k">
                {{ k }}: <b>{{ v }}</b>
              </p>
            </div>
            <br>
            <div v-if="row.item.anyDepotDifferentFromDefault">
              Depots:
              <p v-for="v,k in row.item.depots" :key="k">
                {{ k }}: <b>{{ v }}</b>
              </p>
            </div>
            <br>
            Description: <b v-if="row.item.description!='mixed'">{{ row.item.description }}</b>
            <div v-else>
              <p v-for="v,k in row.item.descriptionDetails" :key="k">
                {{ k }}: <b>{{ v }}</b>
              </p>
            </div>
            <br>
          </small>
          <br>
        </b-container>
      </template>
    </TableTBVTable>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IProp, IProperty } from '../../.utils/types/ttable'
import { IObjectString2Any } from '../../.utils/types/tgeneral'
import { arrayEqual } from '../../.utils/utils/scompares'
import { makeToast } from '../../.utils/utils/scomponents'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Constants } from '../../mixins/uib-mixins'
const selections = namespace('selections')
const settings = namespace('settings')
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class TProductProperties extends Vue {
  iconnames: any
  $axios: any
  $nuxt: any
  $mq: any

  @Prop({ }) id!: string
  @Prop({ default: '' }) errorText!: string
  @Prop({ }) properties!: IProp

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public pushToChangesProducts!: (o: object) => void
  @changes.Mutation public delWithIndexChangesProducts!: (i:number) => void
  @settings.Getter public expert!: boolean

  // errorText: string = ''
  result:Object = {}
  isLoading: boolean = false
  // newValuesPerProp: INewPropertyValue = {}
  fetchedDataClients2Depots: object = {}

  get fields () {
    return [
      { label: 'pId', key: 'propertyId', thStyle: { display: 'none' } },
      { label: 'pValue', key: 'value', thStyle: { display: 'none' } }
    ]
  }

  async beforeMount () {
    if (this.selectionClients.length > 0) {
      await this.$axios.$get(`/api/opsidata/clients/depots?selectedClients=[${this.selectionClients}]`)
        .then((response) => {
          this.fetchedDataClients2Depots = response
          // this.setSession()
        }).catch((error) => {
          this.errorText = (this as any).$t('message.errortext')
          throw new Error(error)
        })
    }
  }

  async saveProdProp (change: object) {
    const t:any = this
    await this.$axios.$post(`/api/opsidata/products/${this.id}/properties`, change)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response)
        makeToast(t, 'Product Property ' + JSON.stringify(change) + ' saved succefully', this.$t('message.success') as string, 'success')
        setTimeout(() => {
          this.$nuxt.refresh()
        }, 5000)
        // this.setSession()
      }).catch((error) => {
        makeToast(t, (error as IObjectString2Any).message, this.$t('message.error') as string, 'danger', 8000)
        // eslint-disable-next-line no-console
        console.error(error)
      })
  }

  async handleChange (propertyId:string, values: Array<string|boolean>, orgValues: Array<string|boolean> /* , type:'UnicodeProductProperty'|'BoolProductProperty' */) {
    console.log('expert? ', this.expert)
    if (this.expert) {
      if (this.selectionClients.length > 0) {
        this.handleTrackingChanges(this.selectionClients, 'clientId', propertyId, values, orgValues)
      } else {
        this.handleTrackingChanges(this.selectionDepots, 'depotId', propertyId, values, orgValues)
      }
      return
    }
    if (!arrayEqual(values, orgValues)) {
      const propObj: any = {}
      propObj[propertyId] = values
      let data = { depotIds: this.selectionDepots, properties: propObj }
      if (this.selectionClients.length > 0) {
        data.clientIds = this.selectionClients
      }
      await this.saveProdProp(data)
    }
  }

  handleTrackingChanges (hosts:Array<string>, key:string, propertyId:string, values: Array<string|boolean>, orgValues: Array<string|boolean> ) {
    for (const h in hosts) {
      const changeObject: Object = {
        user: localStorage.getItem('username'),
        clientId: hosts[h],
        productId: this.id,
        property: propertyId,
        propertyValue: values
      }
      const objIndex = this.changesProducts.findIndex(item => item[key] === hosts[c] && item.productId === this.id && item.property === propertyId)
      if (objIndex > -1) {
        this.delWithIndexChangesProducts(objIndex)
      }
      if (!arrayEqual(values, orgValues)) {
        this.pushToChangesProducts(changeObject)
      }
    }
  }

  updateNewPropertyValuesRow (rowItem: IProperty) {
    if (rowItem.newValue && rowItem.newValues) {
      rowItem.newValues.push(rowItem.newValue)
    }
  }
}
</script>

<style>
.TProductProperties_PropertyId_Row > * {
  display: inline-block;
}
/* .TProductProperties_Table td[aria-colindex$="1"] {
  min-width: 30%;
}
.TProductProperties_Table td[aria-colindex$="2"] {
  max-width: 70%;
}
.TProductProperties_Table {
  max-width: 100% !important;
} */
.TableProductsDetails_EditableProdProp_AddValue_BVFormIInput {
  max-width: calc(100% - 30px);
}
.b-table td > .row,
.b-table td > .row > .row {
  margin: 0px !important;
}

.TProductProperties_row_details > small p {
  margin-left: 10px !important;
  margin-bottom: 0 !important;
}
</style>
