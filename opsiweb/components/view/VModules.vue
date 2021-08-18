<template>
  <DivDScrollResult>
    <template slot="content">
      <p v-if="errorText">
        {{ errorText }}
      </p>
      <b-table v-else :busy="isLoading" stacked :items="[modules]" :fields="['valid', 'expires']">
        <template #table-busy>
          <IconILoading />
        </template>
      </b-table>
    </template>
  </DivDScrollResult>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VModules extends Vue {
  isLoading: boolean = false
  modules: object = {}
  errorText: string = ''
  hideValue : boolean = false

  async fetch () {
    this.isLoading = true
    await this.$axios.$get('/api/opsidata/modulesContent')
      .then((response) => {
        this.modules = response.result
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

</style>
