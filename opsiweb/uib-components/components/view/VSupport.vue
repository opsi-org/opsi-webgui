<template>
  <div data-testid="VSupport" class="support">
    <b-row>
      <b-col v-for="item in supportItems" :key="item.title">
        <CardCSupport v-once :item="item" />
      </b-col>
    </b-row>
    <b-embed
      v-if="withIframe"
      type="iframe"
      class="opsidoc-frame"
      :title="$t('supportPage.documentation.title')"
      :src="($i18n.locale=='de')? `https://docs.opsi.org/opsi-docs-de/4.2/index.html`: `https://docs.opsi.org/opsi-docs-en/4.2/index.html`"
      width="100%"
      height="100%"
      frameborder="0"
      allowfullscreen
    />
    <div v-else>
      {{ $t('supportPage.support.opsi-doc-disabled') }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class VSupport extends Vue {
  $i18n: any
  @Prop({ default: true }) withIframe!: boolean
  get supportItems (): Array<any> {
    return [
      {
        title: 'supportPage.forum.title',
        description: 'supportPage.forum.description',
        buttonname: 'supportPage.forum.button',
        link: 'https://forum.opsi.org/index.php'
      },
      {
        title: 'title.support',
        description: 'supportPage.support.description',
        buttonname: 'supportPage.support.button',
        link: this.$i18n.locale === 'en' ? 'https://www.uib.de/en/support-training/support' : 'https://www.uib.de/de/support-schulung/support'
      }
    ]
  }
}
</script>
<style>
.support {
  width: calc(100% - 15px);
}
.support .embed-responsive,
.support iframe.opsidoc-frame {
  min-height: 700px;
  max-height: 100%;
}
</style>
