<template>
  <div data-testid="VSupport" class="w-100 min-w-1/1">
    <div class="grid grid-cols-2 content-stretch mb-2 items-stretch">
      <div v-for="(item, i) in supportItems" :key="item.title" class="w-full">
        <CardCSupport :item="item" />
      </div>
    </div>
    <div v-if="withIframe">
      <iframe
        class="opsidoc-frame w-100 min-w-1/1 border"
        :src="documentationUrl"
        :title="$t('supportPage.documentation.title')"
      />
    </div>
    <div v-else>
      disabled
      {{ $t('supportPage.support.opsi-doc-disabled') }}
    </div>
  </div>
</template>

<script setup lang="ts">
  const { t, locale } = useI18n()
  const props = defineProps({
    withIframe: { type: Boolean, default: true }
  })

  const supportItems = computed(() => [
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
      link: locale.value === 'en' ? 'https://www.uib.de/en/support-training/support' : 'https://www.uib.de/de/support-schulung/support'
    }
  ])

  const documentationUrl = computed(() =>
    locale.value === 'de'
      ? 'https://docs.opsi.org/opsi-docs-de/4.3/index.html'
      : 'https://docs.opsi.org/opsi-docs-en/4.2/index.html'
  )
</script>

<style scoped>
.opsidoc-frame {
  min-height: calc(100vh - 270px);
  max-height: calc(100vh - 270px);
}
</style>