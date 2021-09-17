<template>
  <p v-if="errorText">
    {{ errorText }}
  </p>
  <b-table
    v-else
    :busy="isLoading"
    borderless
    stacked
    small
    :items="[modules]"
    :fields="Object.keys(modules).filter(k => k !== 'signature')"
  >
    <template #table-busy>
      <IconILoading />
    </template>
  </b-table>
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
        this.errorText = this.$t('message.errortext') as string
      })
    this.isLoading = false
  }
}
</script>
