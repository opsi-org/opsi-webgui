<template>
  <div>
    <BarBPageHeader>
      <template #right>
        <!-- @click="resetCreateNewOpsiClientModal()" -->
        <b-button>
          <b-icon icon="arrow-counterclockwise" /> Reset
        </b-button>
        <!-- :disabled="!newClient.clientNamewithoutDomain" -->
        <!-- @click="createOpsiClient()" -->
        <b-button>
          <b-icon icon="plus" /> Add
        </b-button>
      </template>
    </BarBPageHeader>
    <!-- <IconILoading v-if="isLoading" /> -->
    <DivDScrollResult>
      <template slot="content">
        <FormFAddNewClient />
      </template>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component export default class VClientsAddNew extends Vue {

}
</script>

<style>
</style>
