
<template>
  <div data-testid="VProductProperty">
    <BarBPageHeader v-if="asChild" :title="$t('title.config') + ' - '" :subtitle="id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #left>
        <slot name="IDSelection" />
      </template>
    </BarBPageHeader>
    <DivDScrollResult>
      <template slot="content">
        <b-card class="VProductProperty-Card-Description">
          {{ fetchedData.properties.productDescription || fetchedData.dependencies.productDescription }}
        </b-card>
        <b-tabs v-if="id" v-model="activeTab" lazy small>
          <!-- activeTab {{ activeTab }}, manual {{ activeTabSet }} <br>
          tabPropertiesActive {{ tabPropertiesActive }} disabled {{ tabPropertiesDisabled }}<br>
          tabDependenciesActive {{ tabDependenciesActive }} disabled {{ tabDependenciesDisabled }} <br>
          {{ $fetchState.error }} -->
          <p v-if="$fetchState.pending">
            <IconILoading v-if="isLoading" />
          </p>
          <div v-else-if="$fetchState.error || activeTabSet < -1">
            <p>
              {{ errorText.properties }}
              {{ (errorText.dependencies && errorText.properties)? '\n':'' }}
              {{ errorText.dependencies }}
            </p>
          </div>
          <b-tab
            ref="VProductProperties_TabProperties"
            :title="$t('title.properties') + ((tabPropertiesDisabled)? ' '+ $t('title.propertiesEmpty'):'')"
            :disabled="tabPropertiesDisabled"
          >
            <LazyTableTProductProperties
              v-if="id"
              :id="id"
              :properties="fetchedData.properties"
              :error-text="errorText.properties"
            />
          </b-tab>
          <b-tab
            ref="VProductProperties_TabDependencies"
            :title="$t('title.dependencies') + ((tabDependenciesDisabled)? ' '+ $t('title.dependenciesEmpty'):'')"
            :disabled="tabDependenciesDisabled"
            :active="activeTab===1"
          >
            <LazyTableTProductDependencies
              v-if="id"
              :id="id"
              :dependencies="fetchedData.dependencies"
              :error-text="errorText.properties"
            />
          </b-tab>
        </b-tabs>
      </template>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { IDepend, IProp } from '@/.utils/types/ttable'
const auth = namespace('auth')
const selections = namespace('selections')
interface IErrorDepProp {
  dependencies: string
  properties: string
}
interface IFetchedData {
  dependencies:IDepend,
  properties:IProp
}
@Component
export default class VClientConfig extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  activeTabSet: number = -1
  errorText: IErrorDepProp = { dependencies: '', properties: '' }
  isLoading: boolean = true
  fetchedData: IFetchedData = {
    dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {} },
    properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {} }
  }

  get tabPropertiesDisabled () { return Object.keys(this.fetchedData.properties.properties).length <= 0 }
  get tabDependenciesDisabled () { return this.fetchedData.dependencies.dependencies.length <= 0 }
  get tabPropertiesActive () { return !this.tabPropertiesDisabled || this.tabDependenciesDisabled }
  get tabDependenciesActive () { return this.tabPropertiesDisabled && !this.tabDependenciesDisabled }
  get activeTab () { return (this.activeTabSet >= 0) ? this.activeTabSet : (this.tabPropertiesActive) ? 0 : (this.tabDependenciesActive) ? 1 : 0 }
  set activeTab (val:number) { this.activeTabSet = val }
  @auth.Mutation public setSession!: () => void
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

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
    this.isLoading = true
    this.activeTabSet = -1
    this.fetchedData = {
      dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {} },
      properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {} }
    }
    this.errorText = { properties: '', dependencies: '' }

    await this.$axios.$get(`/api/opsidata/products/${this.id}/dependencies?selectedClients=[${this.selectionClients}]&selectedDepots=[${this.selectionDepots}]`)
      .then((response) => {
        this.fetchedData.dependencies.dependencies = response.dependencies
        this.fetchedData.dependencies.productDescriptionDetails = response.productDescriptionDetails // { 'bonifax.uib.local': 'string' }
        this.fetchedData.dependencies.productVersions = response.productVersions // { 'bonifax.uib.local': '1.0' }
        this.fetchedData.dependencies.productDescription = response.productDescription
        this.setSession()
      }).catch((error) => {
        this.errorText.dependencies = (this as any).$t('message.errorInDependenciesFetch')
        this.activeTabSet = -3
        // eslint-disable-next-line no-console
        console.error(error)
        // throw new Error(error)
      })
    await this.$axios.$get(`/api/opsidata/products/${this.id}/properties?selectedClients=[${this.selectionClients}]&selectedDepots=[${this.selectionDepots}]`)
      .then((response) => {
        this.fetchedData.properties.properties = response.properties
        this.fetchedData.properties.productDescriptionDetails = response.productDescriptionDetails
        this.fetchedData.properties.productVersions = response.productVersions // { 'bonifax.uib.local': '1.0', 'bondepot.uib.local': undefined }
        this.fetchedData.properties.productDescription = response.productDescription
        this.setSession()
      }).catch((error) => {
        this.errorText.properties = (this as any).$t('message.errorInPropertyFetch')
        this.activeTabSet = -3
        // eslint-disable-next-line no-console
        console.error(error)
        // throw new Error(error)
      })
    if (this.activeTabSet >= -1) { this.activeTabSet = -1 }
    this.isLoading = false
  }
}
</script>

<style>
.VProductProperty-Card-Description {
  margin-bottom: 20px;
}
</style>
