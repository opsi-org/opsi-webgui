<template>
  <div data-testid="TProductProperties" class="TProductProperties" :class="{mobile:$mq=='mobile'}">
    <div v-if="!errorText && selectionClients.length <= 0">
      <AlertAAlertLocal show variant="warning">
        <small>{{ $t('message.warning.noClientsSelectedShowDepot') }}</small>
      </AlertAAlertLocal>
    </div>
    <div v-else-if="!errorText && $mq=='mobile'">
      <AlertAAlertLocal show variant="primary">
        <small>{{ $t('table.fields.clientsIds') }}: {{ selectionClients.length }}</small>
      </AlertAAlertLocal>
    </div>
    <div v-if="!errorText && Object.values(properties.productVersions).filter(n => n).length !== selectionDepots.length">
      <AlertAAlertLocal show variant="warning">
        <small>
          {{ $t('message.warning.notOnEachDepot', {count:Object.values(properties.productVersions).filter(n => n).length, countall:selectionDepots.length}) }}
        </small>
      </AlertAAlertLocal>
    </div>
    <div v-if="!errorText && Object.values(properties.productVersions).filter(n => n).some((v)=>v!=Object.values(properties.productVersions).filter(n => n)[0])">
      <AlertAAlertLocal show variant="warning">
        <small>{{ $t('message.warning.differentProductVersions') }}</small>
      </AlertAAlertLocal>
    </div>
    <p v-if="errorText">
      {{ errorText }}
    </p>
    <TableTDefault
      :is-loading="isLoading"
      :error="errorText"
      :items="Object.values(properties.properties)"
      :fields="fields"
      type="productproperties"
    >
      <template #empty>
        <small>{{ $t('table.emptyText') }}</small>
      </template>
      <template #cell(propertyId)="row">
        <TableCellTCProductPropertyId :row="row" :product-versions="properties.productVersions" />
      </template>
      <template #cell(value)="row">
        <b-row :class="{ booli: row.item.type == 'BoolProductProperty'}">
          <TableCellTCProductPropertyValue
            :clients2depots="fetchedDataClients2Depots"
            :row-item="row.item"
            @change="handleChange"
          />
        </b-row>
      </template>
      <template #row-details="row">
        <b-container :class="`TProductProperties_row_details TProductProperties_row_details_${row.item.propertyId}`">
          <small>
            {{ $t('table.details.productproperty.defaults') }} <b v-if="row.item.default!==$t('values.mixed')">[{{ row.item.details }}]</b>
            <div v-else>
              <p v-for="v,k in row.item.defaultDetails" :key="k">
                {{ k }}: <b>{{ v }}</b>
              </p>
            </div>
            <br>
            <div v-if="row.item.anyDepotDifferentFromDefault">
              {{ $t('table.details.productproperty.server') }}
              <p v-for="v,k in row.item.depots" :key="k">
                {{ k }}: <b>{{ v }}</b>
              </p>
            </div>
            <br>
            {{ $t('table.fields.description') }} <b v-if="row.item.description!=$t('values.mixed')">{{ row.item.description }}</b>
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
    </TableTDefault>
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
  @settings.Getter public quicksave!: boolean

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
          // this.errorText = (this as any).$t('message.error.defaulttext')
          throw new Error(error)
        })
    }
  }

  async saveProdProp (change: object) {
    const t:any = this
    this.isLoading = true
    await this.$axios.$post(`/api/opsidata/products/${this.id}/properties`, change)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response)
        makeToast(t, 'Product Property ' + JSON.stringify(change) + ' saved succefully', this.$t('message.success.title') as string, 'success')
        // this.$nuxt.refresh()
        this.$emit('refetch', true)
      }).catch((error) => {
        makeToast(t, (error as IObjectString2Any).message, this.$t('message.error.title') as string, 'danger', 8000)
        // eslint-disable-next-line no-console
        console.error(error)
      })
    this.isLoading = false
  }

  async handleChange (propertyId:string, values: Array<string|boolean>, orgValues: Array<string|boolean> /* , type:'UnicodeProductProperty'|'BoolProductProperty' */) {
    // console.log('quicksave? ', this.quicksave)
    if (!this.quicksave) {
      if (this.selectionClients.length > 0) {
        this.handleTrackingChanges(this.selectionClients, 'clientId', propertyId, values, orgValues)
      } else {
        this.handleTrackingChanges(this.selectionDepots, 'depotId', propertyId, values, orgValues)
      }
      // console.log('handleChange changes ', this.changesProducts)
      return
    }
    if (!arrayEqual(values, orgValues)) {
      const propObj: any = {}
      propObj[propertyId] = values
      const data: IObjectString2Any = { properties: propObj }
      if (this.selectionClients.length > 0) {
        data.clientIds = this.selectionClients
      } else {
        data.depotIds = this.selectionDepots
      }
      await this.saveProdProp(data)
    }
  }

  handleTrackingChanges (hosts:Array<string>, key:string, propertyId:string, values: Array<string|boolean>, orgValues: Array<string|boolean>) {
    for (const h in hosts) {
      const changeObject: Object = {
        user: localStorage.getItem('username'),
        [key]: hosts[h],
        productId: this.id,
        property: propertyId,
        propertyValue: values
      }
      const objIndex = this.changesProducts.findIndex(item => item[key] === hosts[h] && item.productId === this.id && item.property === propertyId)
      if (objIndex > -1) {
        this.delWithIndexChangesProducts(objIndex)
      }
      if (!arrayEqual(values, orgValues)) {
        // console.log('changeobject', changeObject)
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
.TProductProperties  {
  max-height: 100%;
  width: 100%;
}
.TProductProperties .row > * {
  padding-left: 0px;
  padding-right: 0px;
}
/* .mobile.TProductProperties  {
  border: 1px solid green;
  height: 100%;
}
.mobile.TProductProperties .row td:first  {
  border: 1px solid #000;
} */

.TProductProperties_PropertyId_Row > * {
  display: inline-block;
}
.TableProductsDetails_EditableProdProp_AddValue_BVFormIInput {
  max-width: calc(100% - 30px);
}
.b-table td > .row,
.b-table td > .row > .row {
  margin: 0px !important;
}

.TProductProperties_row_details > small p {
  margin-left: 0px !important;
  margin-bottom: 0 !important;
}
</style>
