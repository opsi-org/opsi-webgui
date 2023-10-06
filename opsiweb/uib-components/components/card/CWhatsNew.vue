<template>
  <div v-if="!changelogs.includes('')" data-testid="CChangeLogs" :class="{loadingCursor: $fetchState.pending}">
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <b-card
      :class="supportPage ? '' : 'bg-primary text-light mt-3 mx-auto'"
      :style="$mq === 'mobile' || supportPage ? 'width:100%;' : 'width:50%;max-width:400px;' "
    >
      <h5 class="text-center text-color">
        {{ $t('title.whatsnew') }}
      </h5>
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
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { AlertToast } from '../../mixins/component'

@Component({ mixins: [AlertToast] })
export default class CChangeLogs extends Vue {
  showToastError: any // mixin
  @Prop({ default: false }) supportPage!: string
  $t: any
  $axios: any
  changelogs: any = ''
  $mq: any

  async fetch () {
    await this.$axios.$get('/api/opsidata/changelogs')
      .then((response) => {
        this.changelogs = response.split(/\r?\n/)
      }).catch((error) => {
        this.showToastError(error)
      })
  }

  parseMd (md: string) {
    // heading
    // md = md.replace(/[#]{6}(.+)/g, '<h6>$1</h6>')
    // md = md.replace(/[#]{5}(.+)/g, '<h5>$1</h5>')
    // md = md.replace(/[#]{4}(.+)/g, '<h4>$1</h4>')
    // md = md.replace(/[#]{3}(.+)/g, '<h3>$1</h3>')
    // md = md.replace(/[#]{2}(.+)/g, '<h2>$1</h2>')
    md = md.replace(/#(.+)/g, '<h47>$1</h47>')
    // list
    md = md.replace(/^\s*\n\*/gm, '<ul>\n*')
    md = md.replace(/^(\*.+)\s*\n([^*])/gm, '$1\n</ul>\n\n$2')
    md = md.replace(/^\*(.+)/gm, '<li>$1</li>')
    return md
  }
}
</script>
