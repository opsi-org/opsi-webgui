<template>
  <div class="container-fluid">
    <b-container fluid>
      <b-card>
        <b-card-body>
          <iframe
            :src="`https://docs.opsi.org/opsi-docs-de/4.2/index.html`"
            width="100%"
            height="700"
            frameborder="0"
          />
        </b-card-body>
      </b-card>
    </b-container>
    <span v-for="item in supportItems" :key="item.title">
      <CardCSupport :item="item" />
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class PageSupport extends Vue {
  get supportItems (): Array<object> {
    return [
      // {
      //   title: 'supportPage.documentation.title',
      //   description: 'supportPage.documentation.description',
      //   buttonname: 'supportPage.documentation.button',
      //   link: this.$i18n.locale === 'en' ? 'https://www.uib.de/en/opsi-documentation/documentation' : 'https://www.uib.de/de/opsi-dokumentation/dokumentationen'
      // },
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
