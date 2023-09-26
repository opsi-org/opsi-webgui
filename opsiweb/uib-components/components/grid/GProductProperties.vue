<template>
  <div data-testid="GProductProperties">
    <OverlayOLoading :is-loading="isLoading" />
    <div v-if="!errorText && selectionClients.length <= 0">
      <AlertAAlertLocal show variant="warning" class="noClientsSelectedShowDepot">
        {{ $t('message.warning.noClientsSelectedShowDepot') }}
      </AlertAAlertLocal>
    </div>
    <div v-else-if="!errorText && $mq=='mobile'">
      <AlertAAlertLocal show variant="primary">
        {{ $t('table.fields.clientsIds') + $t('keep-english.colon') }} {{ selectionClients.length }}
      </AlertAAlertLocal>
    </div>
    <div v-if="!errorText && Object.values(properties.productVersions).filter(n => n).length !== selectionDepots.length">
      <AlertAAlertLocal show variant="warning" class="notOnEachDepot">
        {{ $t('message.warning.notOnEachDepot', {count:Object.values(properties.productVersions).filter(n => n).length, countall:selectionDepots.length}) }}
      </AlertAAlertLocal>
    </div>
    <div v-if="!errorText && Object.values(properties.productVersions).filter(n => n).some((v)=>v!=Object.values(properties.productVersions).filter(n => n)[0])">
      <AlertAAlertLocal show variant="warning">
        {{ $t('message.warning.differentProductVersions') }}
      </AlertAAlertLocal>
    </div>
    <p v-if="errorText">
      {{ errorText }}
    </p>
    <span v-for="item, index in properties.properties" :key="index">
      <GridGFormItem variant="longlabel" :new-row-for-value="$mq !== 'desktop'">
        <template #label>
          <div class="d-inline-flex">
            <GridCellGCProductPropertyId :row="item" :product-versions="properties.productVersions" />
            <b-icon :id="`property_${item.propertyId}`" class="mt-1 ml-1" :icon="icon.info" />
          </div>
          <b-tooltip :target="`property_${item.propertyId}`" triggers="hover">
            <b-container :class="`TProductProperties_row_details TProductProperties_row_details_${item.propertyId}`" class="text-left">
              <small>
                {{ $t('table.details.productproperty.defaults') }} <b v-if="item.default!==$t('values.mixed')">{{ $t('keep-english.[content]', { content: item.details }) }}</b>
                <div v-else>
                  <p v-for="v,k in item.defaultDetails" :key="k">
                    {{ k + $t('keep-english.colon') }} <b>{{ v }}</b>
                  </p>
                </div>
                <br>
                <div v-if="item.anyDepotDifferentFromDefault">
                  {{ $t('table.details.productproperty.server') }}
                  <p v-for="v,k in item.depots" :key="k">
                    {{ k + $t('keep-english.colon') }} <b>{{ v }}</b>
                  </p>
                </div>
                <br>
                {{ $t('table.fields.description') }} <b v-if="item.description!=$t('values.mixed')">{{ item.description }}</b>
                <div v-else>
                  <p v-for="v,k in item.descriptionDetails" :key="k">
                    {{ k + $t('keep-english.colon') }} <b>{{ v }}</b>
                  </p>
                </div>
                <br>
              </small>
              <br>
            </b-container>
          </b-tooltip>
        </template>
        <template #value>
          <GridCellGCProductPropertyValue
            :clients2depots="fetchedDataClients2Depots"
            :row-item="item"
            :is-loading="isLoading"
            @change="handleChange"
          />
        </template>
      </GridGFormItem>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IProp, IProperty } from '../../.utils/types/ttable'
import { IObjectString2Any } from '../../.utils/types/tgeneral'
import { ChangeObj } from '../../.utils/types/tchanges'
import { arrayEqual } from '../../.utils/utils/scompares'
import { Icons } from '../../mixins/icons'
import { Client } from '../../mixins/get'
import { SaveProductProperties } from '../../mixins/save'
const selections = namespace('selections')
const settings = namespace('settings')
const changes = namespace('changes')

@Component({ mixins: [Icons, SaveProductProperties, Client] })
export default class GProductProperties extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: '' }) errorText!: string
  @Prop({ }) properties!: IProp
  saveProdProperties:any
  getClientToDepot:any
  icon: any
  $axios: any
  $nuxt: any
  $mq: any
  $t:any
  result:Object = {}
  isLoading: boolean = false
  fetchedDataClients2Depots: object = {}

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public pushToChangesProducts!: (o: object) => void
  @changes.Mutation public delWithIndexChangesProducts!: (i:number) => void
  @settings.Getter public quicksave!: boolean

  async fetch () {
    if (this.selectionClients.length > 0) {
      await this.getClientToDepot(this.selectionClients)
    }
  }

  async handleChange (propertyId:string, values: Array<string|boolean>, orgValues: Array<string|boolean> /* , type:'UnicodeProductProperty'|'BoolProductProperty' */) {
    if (!this.quicksave) {
      if (this.selectionClients.length > 0) {
        this.handleTrackingChanges(this.selectionClients, 'clientId', propertyId, values, orgValues)
      } else {
        this.handleTrackingChanges(this.selectionDepots, 'depotId', propertyId, values, orgValues)
      }
      return
    }
    this.isLoading = true
    if (!arrayEqual(values, orgValues)) {
      const propObj: any = {}
      propObj[propertyId] = values
      const data: IObjectString2Any = { properties: propObj }
      if (this.selectionClients.length > 0) {
        data.clientIds = this.selectionClients
      } else {
        data.depotIds = this.selectionDepots
      }
      await this.saveProdProperties(this.id, data, null, true)
    }
    this.isLoading = false
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
