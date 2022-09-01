<template>
  <div data-testid="CChangeLogs" :class="{loadingCursor: isLoading}">
    <b-card
      class="text-center bg-primary mt-3 mx-auto"
      :style="$mq === 'mobile'? 'width:100%;' : 'width:50%;max-width:400px;' "
    >
      <h5 class="text-light">
        {{ $t('title.whatsnew') }}
      </h5>
      <AlertAAlert ref="changelogsAlert" />
      <b-card-text>
        {{ changelogs }}
      </b-card-text>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class CChangeLogs extends Vue {
  $t: any
  $axios: any
  changelogs: any
  isLoading: boolean = false
  errorText: string = ''

  async fetch () {
    this.isLoading = true
    await this.$axios.$get('/api/test/md')
      .then((response) => {
        this.changelogs = response.result
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.changelogsAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Changelogs', 'danger', detailedError)
        this.errorText = this.$t('message.error.defaulttext') as string
      })
    this.isLoading = false
  }
}
</script>
<style>
</style>
