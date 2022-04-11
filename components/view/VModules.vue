<template>
  <div data-testid="VModules">
    <b-row class="mb-4">
      <b-col class="text-sm-right" cols="2">
        {{ $t('settingsPage.modules.available') }}
      </b-col>
      <b-col>
        <span v-for="m in modules" :key="m">
          <b-form-input :value="m" readonly />
        </span>
      </b-col>
    </b-row>
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
