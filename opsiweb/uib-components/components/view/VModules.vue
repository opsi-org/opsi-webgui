<template>
  <div data-testid="VModules" :class="{loadingCursor: $fetchState.pending}">
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <LazyGridGFormItem v-if="!errorText" v-once :label="$t('form.modules.available')" labelclass="modules" variant="longvalue">
      <template #value>
        <b-form-textarea
          id="modules-list"
          rows="3"
          :label="$t('settingsPage.modules.available')"
          max-rows="30"
          size="sm"
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
  modules: object = {}
  errorText: string = ''

  async fetch () {
    await this.$axios.$get('/api/opsidata/modulesContent')
      .then((response) => {
        this.modules = response.result
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        ref.alert(detailedError, 'danger')
        this.errorText = this.$t('message.error.defaulttext') as string
      })
  }
}
</script>
