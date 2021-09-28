<template>
  <div>
    <BarBPageHeader v-if="asChild" :title="$t('title.config') + ' - ' + id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #left>
        <slot name="IDSelection" />
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <DivDScrollResult>
      <template slot="content">
        <b-card class="VProductProperty-Card-Description">
          {{ fetchedData.properties.productDescription || fetchedData.dependencies.productDescription }}
        </b-card>
        activeTab {{activeTab}}, {{id}}
        <b-tabs v-if="id" v-model="activeTab" lazy small>
          hi
          <b-tab
            ref="VProductProperties_TabProperties"
            :title="$t('title.properties') + ((tabPropertiesDisabled)? ' '+ $t('title.propertiesEmpty'):'')"
            :disabled="tabPropertiesDisabled"
          >
            <!-- :active="activeTab===0" -->
            <!-- :title-link-class="{ disabled:tabPropertiesDisabled, active: tabPropertiesActive }" -->
            <!-- :active="tabPropertiesActive || tabDependenciesDisabled" -->
            <!-- :disabled="tabPropertiesDisabled" -->
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
            <!-- :active="!tabPropertiesActive && !tabDependenciesDisabled" -->
            <!-- :active="!tabPropertiesActive || tabPropertiesDisabled"
            :title-link-class="{ disabled:tabDependenciesDisabled, active: !tabPropertiesActive || tabPropertiesDisabled }" -->
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
import { IDepend, IProp } from '~/types/ttable'
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
  // @Prop({ }) description!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  activeTabSet: number = -1
  errorText: IErrorDepProp = { dependencies: '', properties: '' }
  isLoading: boolean = true
  fetchedData: IFetchedData = {
    dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {} },
    properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {} }
  }

  get tabDependenciesDisabled () { return this.fetchedData.dependencies.dependencies.length <= 0 }
  get tabPropertiesDisabled () { return Object.keys(this.fetchedData.properties.properties).length <= 0 }
  get tabPropertiesActive () { return !this.tabPropertiesDisabled || this.tabDependenciesDisabled }
  get tabDependenciesActive () { return !this.tabPropertiesDisabled && !this.tabDependenciesDisabled }
  get activeTab () { return (this.activeTabSet !== -1) ? this.activeTabSet : (this.tabPropertiesActive) ? 0 : 1 } // (this.tabDependenciesDisabled) ? 0 : 1 }
  set activeTab (val:number) { this.activeTabSet = val }

  @Watch('tabPropertyActive', { deep: true }) tabPropertyActiveChanged () { this.activeTab = -1 }
  @Watch('tabDependenciesActive', { deep: true }) tabDependenciesActiveChanged () { this.activeTab = -1 }

  // @Watch('selectionClients', { deep: true }) selectionClientsChanged () { this.$fetch() }
  // @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () { this.$fetch() }
  // @Watch('activeTab', { deep: true }) activeTabChanged () {
  //   if (this.activeTab === -1 || this.activeTab === 0) {
  //     if (this.$refs.VProductProperties_TabProperties) { this.$refs.VProductProperties_TabProperties.activate() }
  //   } else {
  //     this.$refs.VProductProperties_TabDependencies.activate()
  //   }
  // }
  @Watch('id', { deep: true }) productIdChanged () { this.$fetch() }
  mounted () {
    if (!this.id) {
      this.$router.back()
    }
    // this.tabPropertyActiveChanged()
    // this.tabDependenciesActiveChanged()
    if (this.activeTab === -1) { this.activeTab = 0 }
  }

  // updated () {
  // }

  async fetch () {
    this.isLoading = true
    this.fetchedData = {
      dependencies: { dependencies: [], productVersions: {}, productDescription: '', productDescriptionDetails: {} },
      properties: { properties: {}, productVersions: {}, productDescription: '', productDescriptionDetails: {} }
    }
    this.errorText = { properties: '', dependencies: '' }
    await this.$axios.$get(`/api/opsidata/products/${this.id}/dependencies?selectedClients=[${this.selectionClients}]&selectedDepots=[${this.selectionDepots}]`)
      .then((response) => {
        if (response.status !== 200) {
          this.errorText.dependencies = (this as any).$t('message.errortext')
          throw new Error(response.error)
        }
        this.fetchedData.dependencies.dependencies = response.data.dependencies
        this.fetchedData.dependencies.productDescriptionDetails = { 'bonifax.uib.local': 'string' }
        this.fetchedData.dependencies.productVersions = { 'bonifax.uib.local': '1.0' }
        this.fetchedData.dependencies.productDescription = 'string'
      }).catch((error) => {
        this.errorText.dependencies = (this as any).$t('message.errortext')
        throw new Error(error)
      })
    await this.$axios.$get(`/api/opsidata/products/${this.id}/properties?selectedClients=[${this.selectionClients}]&selectedDepots=[${this.selectionDepots}]`)
      .then((response) => {
        if (response.status !== 200) {
          this.errorText.properties = (this as any).$t('message.errortext')
          throw new Error(response.error)
        }
        this.fetchedData.properties.properties = response.data.properties
        this.fetchedData.properties.productDescriptionDetails = { 'bonifax.uib.local': 'string' }
        this.fetchedData.properties.productVersions = { 'bonifax.uib.local': '1.0', 'bondepot.uib.local': undefined }
        this.fetchedData.properties.productDescription = 'string'
      }).catch((error) => {
        this.errorText.properties = (this as any).$t('message.errortext')
        throw new Error(error)
      })
    this.isLoading = false
  }
}
</script>

<style>
.VProductProperty-Card-Description {
  margin-bottom: 20px;
}
</style>
