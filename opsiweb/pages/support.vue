<template>
  <div class="support">
    <b-row>
      <b-col v-for="item in supportItems" :key="item.title">
        <CardCSupport :item="item" />
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-card>
          <!-- aspect="16by9" -->
          <b-embed
            type="iframe"
            title="OPSI Docs"
            :src="`https://docs.opsi.org/opsi-docs-de/4.2/index.html`"
            width="100%"
            height="100%"
            frameborder="0"
            allowfullscreen
          />
          <!-- <iframe
            title="OPSI Docs"
            :src="`https://docs.opsi.org/opsi-docs-de/4.2/index.html`"
            width="100%"
            height="600"
            frameborder="0"
          /> -->
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class PSupport extends Vue {
  get supportItems (): Array<object> {
    return [
      {
        title: 'supportPage.forum.title',
        description: 'supportPage.forum.description',
        buttonname: 'supportPage.forum.button',
        link: 'https://forum.opsi.org/index.php'
      },
      {
        title: 'supportPage.support.title',
        description: 'supportPage.support.description',
        buttonname: 'supportPage.support.button',
        link: this.$i18n.locale === 'en' ? 'https://www.uib.de/en/support-training/support' : 'https://www.uib.de/de/support-schulung/support'
      }
    ]
  }
}
</script>

<style >
/* .support {
  padding: 0px;
} */
</style>