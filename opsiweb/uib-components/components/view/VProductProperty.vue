<template>
  <div data-testid="VProductProperty">
    <BarBPageHeader :title="$t('title.config') + '' + t_fixed('keep-english.title.delimiter')" :subtitle="id" :closeroute="closeroute" />

    <vue-markdown>
      {{ fetchedData.properties.productDescription || fetchedData.dependencies.productDescription }}
    </vue-markdown>

    <b-tabs v-if="id" v-model="activeTab" small lazy>
      <small v-if="!$fetchState.pending && ($fetchState.error || activeTabSet < -1)">
        <p>
          {{ errorText.properties }}
          {{ (errorText.dependencies && errorText.properties)? '\n':'' }}
          {{ errorText.dependencies }}
        </p>
      </small>

      <p v-if="$fetchState.pending">
        <OverlayOLoading :is-loading="$fetchState.pending" />
      </p>
      <b-tab
        ref="VProductProperties_TabProperties"
        :disabled="tabPropertiesDisabled"
      >
        <template #title>
          <span class="property"> {{ $t('title.properties') + ((!$fetchState.pending && tabPropertiesDisabled)? ' '+ $t('title.Empty'):'') }} </span>
        </template>
        <br>
        <DivDScrollResult>
          <GridGProductProperties
            :id="id"
            :properties="fetchedData.properties"
            :error-text="errorText.properties"
            @refetch="fetchProperties"
          />
        </DivDScrollResult>
      </b-tab>
      <b-tab
        ref="VProductProperties_TabDependencies"
        :disabled="tabDependenciesDisabled"
        :active="activeTab===1"
      >
        <template #title>
          <span class="dependency"> {{ $t('title.dependencies') + ((!$fetchState.pending && tabDependenciesDisabled)? ' '+ $t('title.Empty'):'') }} </span>
        </template>
        <br>
        <DivDScrollResult>
          <GridGProductDependencies :id="id" :dependencies="fetchedData.dependencies" />
        </DivDScrollResult>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
import { AlertToast } from '../../mixins/component'
import { Strings } from '../../mixins/strings'
import { IErrorDepProp, IFetchedData } from '../../.utils/types/tobjects'

const selections = namespace('selections')
const changes = namespace('changes')

@Component({ mixins: [Strings, AlertToast] })
export default class VProductProperty extends Vue {
  showToastError: any // mixin
  t_fixed: any
  $fetchState: any
  $axios: any
  $fetch: any
  $mq: any
  $t: any
  $router: any

  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  activeTabSet: number = -1
  errorText: IErrorDepProp = { dependencies: '', properties: '' }
  fetchedData: IFetchedData = {
    dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {} },
    properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {} }
  }

  get username () { return localStorage.getItem('username') }
  get tabPropertiesDisabled () { return Object.keys(this.fetchedData.properties.properties).length <= 0 }
  get tabDependenciesDisabled () { return this.fetchedData.dependencies.dependencies.length <= 0 }
  get tabPropertiesActive () { return !this.tabPropertiesDisabled || this.tabDependenciesDisabled }
  get tabDependenciesActive () { return this.tabPropertiesDisabled && !this.tabDependenciesDisabled }
  get activeTab () {
    if (this.activeTabSet >= 0) {
      return this.activeTabSet
    }
    if (this.tabPropertiesActive) {
      return 0
    } else {
      return 1
    }
  }

  set activeTab (val:number) { this.activeTabSet = val }
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @changes.Getter public changesProducts!: Array<ChangeObj>

  @Watch('selectionClients') selectionClientsChanged () { this.$fetch() }
  @Watch('selectionDepots') selectionDepotsChanged () { this.$fetch() }
  @Watch('tabPropertyActive') tabPropertyActiveChanged () { this.activeTab = -1 }
  @Watch('tabDependenciesActive') tabDependenciesActiveChanged () { this.activeTab = -1 }
  @Watch('id', { deep: true }) productIdChanged () { this.$fetch() }

  mounted () {
    if (!this.id) {
      this.$router.back()
    }
  }

  async fetch () {
    this.activeTabSet = -1
    this.fetchedData = {
      dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {} },
      properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {} }
    }
    this.errorText = { properties: '', dependencies: '' }

    await this.fetchProperties()
    await this.fetchDependencies()

    if (this.activeTabSet >= -1) { this.activeTabSet = -1 }
  }

  async fetchProperties (refetch:boolean = false) {
    await this.$axios.$get(`/api/opsidata/products/${this.id}/properties?selectedClients=[${this.selectionClients}]&selectedDepots=[${this.selectionDepots}]`)
      .then((response) => {
        this.fetchedData.properties.properties = response.properties
        this.fetchedData.properties.productDescriptionDetails = response.productDescriptionDetails
        this.fetchedData.properties.productVersions = response.productVersions // { 'bonifax.uib.local': '1.0', 'bondepot.uib.local': undefined }
        this.fetchedData.properties.productDescription = response.productDescription
        if (refetch) {
          this.fetchedData.properties = { ...this.fetchedData.properties }
        }
      }).catch((error) => {
        this.errorText.properties = (this as any).$t('message.error.fetch.productProperty')
        this.activeTabSet = -3
        this.showToastError(error)
      })
  }

  async fetchDependencies () {
    await this.$axios.$get(`/api/opsidata/products/${this.id}/dependencies?selectedClients=[${this.selectionClients}]&selectedDepots=[${this.selectionDepots}]`)
      .then((response) => {
        this.fetchedData.dependencies.dependencies = response.dependencies
        this.fetchedData.dependencies.productDescriptionDetails = response.productDescriptionDetails // { 'bonifax.uib.local': 'string' }
        this.fetchedData.dependencies.productVersions = response.productVersions // { 'bonifax.uib.local': '1.0' }
        this.fetchedData.dependencies.productDescription = response.productDescription
      }).catch((error) => {
        this.errorText.dependencies = (this as any).$t('message.error.fetch.productDependency')
        this.activeTabSet = -3
        this.showToastError(error)
      })
  }
}
</script>
