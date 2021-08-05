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
        <!-- <br /> -->
        <b-tabs v-if="id">
          <b-tab title="Properties" active>
            <LazyTableTProductProperties v-if="id" :id="id" :properties="fetchedData.properties" />
          </b-tab>
          <b-tab title="Dependencies" :disabled="fetchedData.dependencies.length <= 0">
            <LazyTableTProductDependencies :id="id" :dependencies="fetchedData.dependencies" />
          </b-tab>
        </b-tabs>
      </template>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { IProductPropertyConfig } from '~/types/ttable'

@Component
export default class VClientConfig extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  fetchedData!: IProductPropertyConfig
  isLoading: boolean = true

  mounted () {
    if (!this.id) {
      this.$router.back()
    }
  }

  /* async */ fetch () {
    this.fetchedData = {
      description: 'This is the description',
      dependencies: [
        { productId: 'a', required: 'installed:', 'pre-required': 'installed:', 'post-required': ':setup', 'on deinstall': '' },
        { productId: 'b', required: 'installed:', 'pre-required': '', 'post-required': '', 'on deinstall': '' },
        { productId: 'c', required: '', 'pre-required': 'installed:', 'post-required': '', 'on deinstall': '' },
        { productId: 'd', required: '', 'pre-required': '', 'post-required': ':setup', 'on deinstall': '' },
        { productId: 'e', required: '', 'pre-required': '', 'post-required': '', 'on deinstall': 'uninstall' }
      ],
      properties: {
        uninstall_before_install: { propertyId: 'uninstall_before_install', clientsIds: ['anna-tp-t14.uib.local'], clientsValues: [[true]], depotsIds: ['bonifax.uib.local'], depotsValues: [[false]], possibleValues: [true, false], editable: false, multiValue: false, version: '19.00-1', propertyType: 'BoolProductProperty' },
        uninstall_before_install1: { propertyId: 'uninstall_before_install1', clientsIds: ['anna-tp-t14.uib.local'], clientsValues: [[false]], depotsIds: ['bonifax.uib.local'], depotsValues: [[false]], possibleValues: [true, false], editable: false, multiValue: false, version: '19.00-1', propertyType: 'BoolProductProperty' },
        uninstall_before_install2: { propertyId: 'uninstall_before_install2', clientsIds: ['anna-tp-t14.uib.local'], clientsValues: [[true]], depotsIds: ['bonifax.uib.local'], depotsValues: [[true]], possibleValues: [true, false], editable: false, multiValue: false, version: '19.00-1', propertyType: 'BoolProductProperty' },
        architecture: { propertyId: 'architecture', clientsIds: ['anna-tp-t14.uib.local'], clientsValues: [['64bit']], depotsIds: ['bonifax.uib.local'], depotsValues: [['64bit']], possibleValues: ['32bit', '64bit', 'sysnativ'], editable: false, multiValue: false, version: '19.00-1', propertyType: 'UnicodeProductProperty' },
        architecture1: { propertyId: 'architecture1', clientsIds: ['anna-tp-t14.uib.local'], clientsValues: [['32bit']], depotsIds: ['bonifax.uib.local'], depotsValues: [['64bit']], possibleValues: ['32bit', '64bit', 'sysnativ'], editable: false, multiValue: false, version: '19.00-1', propertyType: 'UnicodeProductProperty' },
        architecture2: { propertyId: 'architecture2', clientsIds: ['anna-tp-t14.uib.local'], clientsValues: [['64bit'], ['32bit']], depotsIds: ['bonifax.uib.local'], depotsValues: [['64bit']], possibleValues: ['32bit', '64bit', 'sysnativ'], editable: false, multiValue: false, version: '19.00-1', propertyType: 'UnicodeProductProperty' },
        architecture3: { propertyId: 'architecture3', clientsIds: ['anna-tp-t14.uib.local', 'anna-vm-24001.uib.local'], clientsValues: [['64bit'], ['32bit']], depotsIds: ['bonifax.uib.local'], depotsValues: [['64bit']], possibleValues: ['32bit', '64bit', 'sysnativ'], editable: true, multiValue: true, version: '19.00-1', propertyType: 'UnicodeProductProperty' },
        architecture4: { propertyId: 'architecture4', clientsIds: ['anna-tp-t14.uib.local', 'anna-vm-24001.uib.local'], clientsValues: [['64bit', '32bit'], ['32bit', '64bit']], depotsIds: ['bonifax.uib.local'], depotsValues: [['64bit']], possibleValues: ['32bit', '64bit', 'sysnativ'], editable: true, multiValue: true, version: '19.00-1', propertyType: 'UnicodeProductProperty' },
        architecture5: { propertyId: 'architecture5', clientsIds: ['anna-tp-t14.uib.local', 'anna-vm-24001.uib.local'], clientsValues: [['64bit', '32bit'], ['32bit']], depotsIds: ['bonifax.uib.local'], depotsValues: [['64bit']], possibleValues: ['32bit', '64bit', 'sysnativ'], editable: true, multiValue: true, version: '19.00-1', propertyType: 'UnicodeProductProperty' },
        desktop_icon: { propertyId: 'desktop_icon', clientsIds: ['anna-tp-t14.uib.local', 'anna-vm-24001.uib.local'], clientsValues: [[true], [false]], depotsIds: ['bonifax.uib.local'], depotsValues: [[false]], possibleValues: [true, false], editable: false, multiValue: false, version: '19.00-1', propertyType: 'BoolProductProperty' }
      }
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
