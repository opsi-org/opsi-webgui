<template>
  <div data-testid="VModules" :class="{loadingCursor: isLoading}">
    <AlertAAlert ref="modulesAlert" />
    <LazyGridGFormItem v-if="!errorText" label-id="modules" :label="$t('form.modules.available')">
      <template #value>
        <b-form-textarea
          id="modules-list"
          rows="3"
          :label="$t('settingsPage.modules.available')"
          max-rows="30"
          no-resize
          plaintext
          :value="Object.values(modules).join('\n')"
        />
      </template>
    </LazyGridGFormItem>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VModules extends Vue {
  $axios: any
  $t:any
  isLoading: boolean = false
  modules: object = {}
  errorText: string = ''

  async fetch () {
    this.isLoading = true
    await this.$axios.$get('/api/opsidata/modulesContent')
      .then((response) => {
        this.modules = response.result
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.modulesAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Modules', 'danger', detailedError)
        this.errorText = this.$t('message.error.defaulttext') as string
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
