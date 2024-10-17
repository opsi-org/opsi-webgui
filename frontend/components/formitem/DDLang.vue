<template>
  <el-dropdown
    id="quicksettingsDD"
    :class="footer ? '!border-none' : 'border'"
    @command="$i18n.locale = $event"
  >
    <IconIIcon :icon="icon.language"/>
    <el-text>{{ $i18n.locale.toUpperCase() }}</el-text>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="(lang, i) in $i18n.availableLocales"
          :key="i"
          :command="lang"
          :class="{ 'is-active': lang === $i18n.locale }"
          :data-testid="`DropdownDDLang-Item-${lang}`"
        >
          <span style="text-transform:uppercase;">{{ lang }}</span>
          <span>{{ ['en', 'de', 'fr'].includes(lang) ? '' : $t('button.lang.community-created') }}</span>
        </el-dropdown-item>
        <el-dropdown-item
          divided
          :data-testid="`DropdownDDLang-Item-contribute`"
          :title="$t('button.contribute-transifex.tooltip')"
        >
          <a href="https://app.transifex.com/opsi-org/opsiorg/opsi-webguijson/" target="_blank" class="dropdown-item-link">
            {{ $t('button.contribute-transifex') }}
          </a>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { useIcons } from "../../composables/mixins/useIcons"
const icon = useIcons()

const props = defineProps({
  footer: { type: Boolean, default: false}
})
</script>