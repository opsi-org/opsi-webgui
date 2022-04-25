<template>
  <div data-testid="VModules" :class="'VModules ' + $mq">
    <b-row class="mt-4">
      <b-col class="text-sm-right col" cols="2">
        <label for="modules-list"> {{ $t('settingsPage.modules.available') }} </label>
      </b-col>
      <b-col>
        <b-form-textarea
          id="modules-list"
          rows="3"
          :label="$t('settingsPage.modules.available')"
          max-rows="30"
          no-resize
          plaintext
          :value="Object.values(modules).join('\n')"
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
        this.errorText = this.$t('message.errortext') as string
      })
    this.isLoading = false
  }
}
</script>
<style>
.VModules.mobile .col{
  display: contents;
}
</style>
