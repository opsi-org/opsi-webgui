<template>
  <el-dropdown id="quicksettingsDD" @command="$i18n.locale = $event">
    <el-button link>
      <IconIIcon :icon="icon.language" class="inline mr-1" />
      <el-text>{{ $i18n.locale.toUpperCase() }}</el-text>
      <i class="el-icon-arrow-down el-icon--right"></i>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="(lang, i) in $i18n.availableLocales"
          :key="i"
          :command="lang"
          :class="{ 'is-active': lang === $i18n.locale }"
          :data-testid="`DropdownDDLang-Item-${lang}`"
        >
          <span style="text-transform: uppercase">{{ lang }}</span>
          <span>{{
            ['en', 'de', 'fr'].includes(lang)
              ? ''
              : $t('button.lang.community-created')
          }}</span>
        </el-dropdown-item>
        <el-dropdown-item
          divided
          :data-testid="`DropdownDDLang-Item-contribute`"
          :title="$t('button.contribute-transifex.tooltip')"
        >
          <a
            href="https://app.transifex.com/opsi-org/opsiorg/opsi-webguijson/"
            target="_blank"
            class="dropdown-item-link"
          >
            {{ $t('button.contribute-transifex') }}
          </a>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
  const icon = useIcons()

  const _props = defineProps({
    footer: { type: Boolean, default: false },
  })
</script>
