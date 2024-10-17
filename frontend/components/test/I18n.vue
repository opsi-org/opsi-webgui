<template>
  <div>
    <!-- <form>
      Langs: {{  $i18n.availableLocales }}
      <label for="locale-select">{{ $t('language') }}: </label>
      <select id="locale-select" v-model="$i18n.locale">
        <option value="en">en</option>
        <option value="de">de</option>
        <option value="es">es</option>
      </select>
    </form> -->

    <b-dropdown
      id="quicksettingsDD"
      data-testid="DropdownDDLang"
      :aria-label="$t('button.lang.tooltip')"
      :title="$t('button.lang.tooltip')"
      :variant="footer? 'primary !border-none' : 'outline-primary'"
      size="sm"
      :dropup="footer"
    >
      <template #button-content>
        <span style="text-transform:uppercase;"> <IconIIcon :icon="icon.language" /> {{ $i18n.locale }} </span>
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
        href="https://app.transifex.com/opsi-org/opsiorg/opsi-webguijson/"
        target="_blank"
        >
        <span> {{ $t('button.contribute-transifex') }} </span>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script setup>
import { useIcons } from "../../composables/mixins/useIcons"
const icon = useIcons()
// const languages = $i18n.availableLocales
// const language = $i18n.locale

const _props = defineProps({
  footer: { type: Boolean, default: false}
})
</script>
