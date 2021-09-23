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
        <b-tabs v-if="id">
          <b-tab :title="$t('title.properties')" active>
            <LazyTableTProductProperties v-if="id" :id="id" :properties="fetchedData.properties" />
          </b-tab>
          <b-tab :title="$t('title.dependencies')" :disabled="fetchedData.dependencies.length <= 0">
            <LazyTableTProductDependencies :id="id" :dependencies="fetchedData.dependencies" />
          </b-tab>
        </b-tabs>
        <b-card class="VProductProperty-Card-Description">
          {{ fetchedData.description }}
        </b-card>
      </template>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { IProductPropertyConfig /*, ITableData */ } from '~/types/ttable'
const selections = namespace('selections')

@Component
export default class VClientConfig extends Vue {
  @Prop({ }) id!: string
  // @Prop({ }) description!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  fetchedData: IProductPropertyConfig = { description: '', dependencies: [], properties: [] }
  errorText: string = ''
  isLoading: boolean = true
  // tableData: ITableData = {
  //   type: 'NetbootProduct',
  //   pageNumber: 1,
  //   perPage: 5,
  //   sortBy: 'productId',
  //   sortDesc: false,
  //   filterQuery: '',
  //   setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  // }

  @Watch('id', { deep: true }) productIdChanged () { this.$fetch() }
  mounted () {
    if (!this.id) {
      this.$router.back()
    }
  }

  /* async */ fetch () {
    // TODO: Backend-Request getProductProperty
    // const params = {
    //   selectionClients: this.selectionClients,
    //   // productId: this.id
    // }

    // this.fetchedData.description = 'description'
    // this.tableData.type = ''
    // this.tableData.filterQuery = this.id
    // this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
    // this.tableData.selectedClients = JSON.stringify(this.selectionClients)
    // const params = this.tableData
    // // this.fetchedData = (await this.$axios.$get('/api/opsidata/products', { params })).result
    // await this.$axios.$get('/api/opsidata/products', { params })
    //   .then((response) => {
    //     this.fetchedData = response.result
    //   }).catch((error) => {
    //   // eslint-disable-next-line no-console
    //     console.error(error)
    //     this.errorText = (this as any).$t('message.errortext')
    //   })

    // if (this.selectionClients.length > 0) {
    //   // const params = { selectedClients: this.selectionClients }

    //   await this.$axios.$get(`/api/opsidata/products/${this.id}/dependencies?selectedClients=${this.selectionClients}`)
    //     .then((response) => {
    //       this.fetchedData.dependencies = response.data
    //     }).catch((error) => {
    //       // eslint-disable-next-line no-console
    //       console.error(error)
    //       this.errorText = (this as any).$t('message.errortext')
    //     })
    //   await this.$axios.$get(`/api/opsidata/products/${this.id}/properties?selectedClients=${this.selectionClients}`)
    //     .then((response) => {
    //       this.fetchedData.properties = response.data
    //     }).catch((error) => {
    //       // eslint-disable-next-line no-console
    //       console.error(error)
    //       this.errorText = (this as any).$t('message.errortext')
    //     })
    // }
    this.setSelectionClients(['anna-tp-t14.uib.local', 'anna-vm-24001.uib.local'])
    this.fetchedData = {
      description: 'This is the description',
      dependencies: [
        { productId: '04-schulen-nuernberg_fos2_nb_step1', productAction: 'setup', version: '1.0-1', requiredProductId: '04-schulen-nuernberg_fos2_nb_step2', requiredVersion: null, requiredAction: 'setup', requiredInstallationStatus: null, requirementType: null },
        { productId: '04-schulen-nuernberg_fos2_nb_step1', productAction: 'setup', version: '1.0-1', requiredProductId: 'activate-win', requiredVersion: null, requiredAction: null, requiredInstallationStatus: 'installed', requirementType: null },
        { productId: 'ac2011', productAction: 'setup', version: '11.0-1', requiredProductId: 'dotnetfx', requiredVersion: null, requiredAction: null, requiredInstallationStatus: 'installed', requirementType: 'before' },
        { productId: '1st-customize', productAction: 'setup', version: '17-3', requiredProductId: 'clientdescription', requiredVersion: null, requiredAction: 'once', requiredInstallationStatus: null, requirementType: 'after' },
        { productId: 'sas', productAction: 'uninstall', version: '9.2-2', requiredProductId: 'javavm', requiredVersion: null, requiredAction: null, requiredInstallationStatus: 'installed', requirementType: 'before' }
      ],

      properties: [
        {
          propertyId: 'unicode',
          propertyType: 'UnicodeProductProperty',
          description: 'this is an unicode property',
          multiValue: true,
          editable: true,
          newValue: '',
          newValues: [],
          default: ['a'],
          possibleValues: ['a', 'b', 'c'],
          // defaultDetails:{d1: x, d2:y},
          // descriptionDetails: {d1: x, d2:y},

          depots: { 'bonifax.uib.local': ['a', 'b'] },
          clients: {
            'anna-tp-14.uib.local': ['a'],
            'anna-vm-24001.uib.local': ['a', 'b'] // <depotValue:a>
          },
          // visibleValues: <mixed>

          anyDepotDifferentFromDefault: true,
          anyClientDifferentFromDepot: true
        },
        {
          propertyId: 'boolean',
          propertyType: 'BoolProductProperty',
          description: 'this is an boolean property',
          multiValue: false,
          editable: false,
          default: [true],
          possibleValues: [true, false],
          depots: { 'bonifax.uib.local': [false] },
          clients: {
            'anna-tp-14.uib.local': [true],
            'anna-vm-24001.uib.local': [false] // <depotValue:a>
          },

          anyDepotDifferentFromDefault: true,
          anyClientDifferentFromDepot: true
        }
      ]
    }
    // this.fetchedData = (await this.$axios.$post(
    //   '/api/opsidata/products',
    //   JSON.stringify(this.tableData)
    // )).result
    this.isLoading = false
  }
}
</script>

<style>
.VProductProperty-Card-Description {
  margin-bottom: 20px;
}
</style>
