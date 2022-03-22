<template>
  <div data-testid="VModules">
    <b-row>
      <b-col cols="2">
        <b> {{ $t('settingsPage.modules.available') }} </b>
      </b-col>
      <b-col>
        <span v-for="m in modules" :key="m">
          {{ m }} <br>
        </span>
      </b-col>
    </b-row>

    <!-- <TableTBVTable
      :stacked="true"
      :is-loading="isLoading"
      :error="errorText"
      :items="[modules]"
      :fields="Object.keys(modules).filter(k => k !== 'signature')"
    /> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VModules extends Vue {
  $axios: any

  isLoading: boolean = false
  modules: object = {}
  errorText: string = ''

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
