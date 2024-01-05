<template>
  <div data-testid="VClientClone" class="VClientClone">
    <OverlayOLoading :is-loading="isLoading" />
    <BarBPageHeader v-if="asChild" :title="$t('title.cloneclient') +''+ t_fixed('keep-english.title.delimiter')" :subtitle="id" :closeroute="closeroute" />
    <GridGFormItem v-if="!asChild" :label="$t('table.fields.sourceclient')">
      <template #value>
        <slot name="IDSelection" />
      </template>
    </GridGFormItem>
    <span v-for="options,category,index in cloneclient" :key="index">
      <b-row class="text-capitalize text-small mt-3 mb-2 pl-1">
        <b>{{ category }} </b>
      </b-row>
      <span v-for="val,param,i in options" :key="i">
        <GridGFormItem :label="param" labelclass="text-capitalize">
          <template #value>
            <div v-if="param.toString() === 'hostId'" class="d-flex flex-nowrap">
              <b-form-input
                id="clientname"
                v-model="clientName"
                :aria-label="$t('table.name.client')"
                size="sm"
                type="text"
                trim
                :state="checkValid"
                required
              />
              <b-form-invalid-feedback :state="checkValid">
                <span v-if="clientIds.includes(clientName + domain)"> {{ $t('message.formvalid.clientExists') }} </span>
              </b-form-invalid-feedback>
              <b-form-input
                id="domainName"
                v-model="domainName"
                class="domainName"
                :aria-label="$t('table.name.domain')"
                size="sm"
                type="text"
                trim
                required
              />
            </div>
            <b-form-checkbox v-else-if="typeof val == 'boolean'" :id="param" v-model="cloneclient[category][param.toString()]" size="sm" :aria-label="param" />
            <b-form-input
              v-else
              :id="param"
              v-model="cloneclient[category][param.toString()]"
              size="sm"
              :aria-label="param"
              type="text"
            />
          </template>
        </GridGFormItem>
      </span>
    </span>
    <GridGFormItem>
      <template #value>
        <div class="float-right mt-2">
          <b-button id="resetButton" class="resetButton" size="sm" variant="primary" @click="resetForm()">
            <IconIIcon :icon="icon.reset" /> {{ $t('button.reset') }}
          </b-button>
          <b-button id="cloneButton" class="cloneButton" size="sm" variant="success" @click="cloneClient">
            <IconIIcon :icon="icon.client" /> {{ $t('title.clone') }}
          </b-button>
        </div>
      </template>
    </GridGFormItem>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { Strings } from '../../mixins/strings'
import { Client } from '../../mixins/get'
import { AlertToast } from '../../mixins/component'
import { CloneClient } from '../../.utils/types/tobjects'
const selections = namespace('selections')
@Component({ mixins: [Icons, Strings, AlertToast, Client] })
export default class VClientClone extends Vue {
  showToastWarning:any // mixin
  showToastSuccess: any // from mixin AlertToast
  showToastError: any // from mixin AlertToast
  getClientIdList:any
  icon: any
  t_fixed: any
  $axios:any
  $t:any

  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  @selections.Getter public selectionDepots!: Array<string>

  clientName: string = ''
  domain: string = ''
  isLoading: boolean = false
  clientIds: Array<string> = []

  cloneclient: CloneClient = {
    target: {
      hostId: '',
      ipAddress: '',
      hardwareAddress: '',
      systemUUID: ''
    },
    options: {
      configs: false,
      products: false,
      productPropeties: false
    }
  }

  get domainName () {
    const result = this.id.substring(this.id.indexOf('.'))
    this.domain = result
    return result
  }

  set domainName (val: string) {
    this.domain = val
  }

  get checkValid () {
    return this.clientName.length > 0 && !Number.isInteger(parseInt(this.clientName.charAt(0))) && !this.clientIds.includes(this.clientName + this.domain)
  }

  async fetch () {
    await this.fetchClients()
  }

  async fetchClients () {
    this.clientIds = await this.getClientIdList(this.selectionDepots)
  }

  async cloneClient () {
    this.isLoading = true
    this.cloneclient.target.hostId = this.clientName + this.domain
    await this.$axios.$post(`/api/opsidata/clients/${this.id}/clone`, this.cloneclient)
      .then((response) => {
        this.showToastSuccess(response)
      })
      .catch((error) => {
        this.showToastError(error)
      })
    this.isLoading = false
  }

  resetForm () {
    this.clientName = ''
    this.cloneclient = {
      target: {
        hostId: '',
        ipAddress: '',
        hardwareAddress: '',
        systemUUID: ''
      },
      options: {
        configs: false,
        products: false,
        productPropeties: false
      }
    } as CloneClient
  }
}
</script>

<style>
.VClientClone {
  overflow-x: hidden;
  padding-left: 10px;
}
</style>
