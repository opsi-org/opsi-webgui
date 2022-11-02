<template>
  <div v-if="!changelogs.includes('')" data-testid="CChangeLogs" :class="{loadingCursor: isLoading}">
    <OverlayOLoading :is-loading="isLoading" />
    <b-card
      class="background text-color mt-3 mx-auto"
      :style="$mq === 'mobile'? 'width:100%;' : 'max-width:500px;' "
    >
      <h5 class="text-center text-color">
        {{ $t('title.whatsnew') }}
      </h5>
      <AlertAAlert ref="changelogsAlert" />
      <div
        v-for="(log, index) in changelogs"
        :key="index"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="parseMd(log)" />
      </div>
    </b-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class CChangeLogs extends Vue {
  $t: any
  $axios: any
  changelogs: any = ''
  isLoading: boolean = false
  errorText: string = ''
  $mq: any

  async fetch () {
    this.isLoading = true
    await this.$axios.$get('/api/opsidata/changelogs')
      .then((response) => {
        this.changelogs = response.split(/\r?\n/)
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.changelogsAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Changelogs', 'danger', detailedError)
        this.errorText = this.$t('message.error.defaulttext') as string
      })
    this.isLoading = false
  }

  parseMd (md: string) {
    // heading
    // md = md.replace(/[#]{6}(.+)/g, '<h6>$1</h6>')
    // md = md.replace(/[#]{5}(.+)/g, '<h5>$1</h5>')
    // md = md.replace(/[#]{4}(.+)/g, '<h4>$1</h4>')
    // md = md.replace(/[#]{3}(.+)/g, '<h3>$1</h3>')
    // md = md.replace(/[#]{2}(.+)/g, '<h2>$1</h2>')
    md = md.replace(/[#]{1}(.+)/g, '<h47>$1</h47>')
    // list
    md = md.replace(/^\s*\n\*/gm, '<ul>\n*')
    md = md.replace(/^(\*.+)\s*\n([^*])/gm, '$1\n</ul>\n\n$2')
    md = md.replace(/^\*(.+)/gm, '<li>$1</li>')
    return md
  }
}
</script>
