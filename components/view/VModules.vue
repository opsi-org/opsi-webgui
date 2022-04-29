<template>
  <div data-testid="VModules">
    <b-row class="mb-4">
      <b-col class="text-sm-right" cols="2">
        {{ $t('form.modules.available') }}
      </b-col>
      <b-col>
        <b-form-textarea
          rows="3"
          max-rows="6"
          no-resize
          plaintext
          :value="modules"
        />
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
        this.errorText = this.$t('message.error.defaulttext') as string
      })
    this.isLoading = false
  }
}
</script>
