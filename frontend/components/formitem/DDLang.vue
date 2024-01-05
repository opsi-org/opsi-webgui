<template>
    <b-dropdown
      id="quicksettingsDD"
      data-testid="DropdownDDLang"
      :aria-label="$t('button.lang.tooltip')"
      :title="$t('button.lang.tooltip')"
      :class="footer? 'border-0 ' : ''"
      :variant="footer? 'primary' : 'outline-primary'"
      size="sm"
      :dropup="footer"
    >
      <template #button-content>
        <span class="inline-flex min-w-max">
          <IconIIcon :icon="icon.language" class=""/>
          <span v-if="footer !== false" class="text-xs uppercase pl-1 ">{{ $i18n.locale }}</span>
        </span>
      </template>
      <b-dropdown-item
        v-for="(lang, i) in $i18n.availableLocales"
        :key="i"
        :class="{ selected: lang==$i18n.locale }"
        :data-testid="`DropdownDDLang-Item-${lang}`"
        @click="$i18n.locale = lang"
      >
        <span style="text-transform:uppercase;"> {{ lang }} </span>
        <span>{{ (['en', 'de', 'fr'].includes(lang)) ? '': $t('button.lang.community-created') }}</span>
      </b-dropdown-item>
      <b-dropdown-item
        :data-testid="`DropdownDDLang-Item-contribute`"
        :title="$t('button.contribute-transifex.tooltip')"
        href="https://app.transifex.com/opsi-org/opsiorg/opsiweb-uijson/"
        target="_blank"
        >
        <span> {{ $t('button.contribute-transifex') }} </span>
      </b-dropdown-item>
    </b-dropdown>
</template>

<script setup>
import { useIcons } from "../../composables/mixins/useIcons"
const icon = useIcons()

const props = defineProps({
  footer: { type: Boolean, default: false}
})
</script>
