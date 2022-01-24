<template>
  <div data-testid="VModules">
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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VModules extends Vue {
  $axios: any
  // $nuxt: any
  // $fetch: any
  // $mq: any
  // $t: any
  isLoading: boolean = false
  modules: object = {}
  errorText: string = ''
  hideValue : boolean = false
  // @auth.Mutation public setSession!: () => void

  async fetch () {
    this.isLoading = true
    await this.$axios.$get('/api/opsidata/modulesContent')
      .then((response) => {
        this.modules = response.result
        // this.setSession()
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.errorText = this.$t('message.errortext') as string
      })
    this.isLoading = false
  }
}
</script>
