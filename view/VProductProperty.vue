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
          {{ fetchedData.description }}
        </b-card>
        <b-tabs v-if="id">
          <b-tab :title="$t('title.properties')" active>
            <LazyTableTProductProperties v-if="id" :id="id" :properties="fetchedData.properties" />
          </b-tab>
          <b-tab :title="$t('title.dependencies')" :disabled="fetchedData.dependencies.length <= 0">
            <LazyTableTProductDependencies :id="id" :dependencies="fetchedData.dependencies" />
          </b-tab>
        </b-tabs>
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

  fetchedData: IProductPropertyConfig = { description: '', dependencies: [], properties: {} }
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

  async fetch () {
    await this.$axios.$get(`/api/opsidata/products/${this.id}/dependencies?selectedClients=[${this.selectionClients}]`)
      .then((response) => {
        this.fetchedData.dependencies = response.data.dependencies
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.errorText = (this as any).$t('message.errortext')
      })
    await this.$axios.$get(`/api/opsidata/products/${this.id}/properties?selectedClients=[${this.selectionClients}]`)
      .then((response) => {
        this.fetchedData.properties = response.data.properties
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.errorText = (this as any).$t('message.errortext')
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
