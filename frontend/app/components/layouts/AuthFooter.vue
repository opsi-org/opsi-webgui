<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  LayoutsAuthFooter - Auth page footer with theme/language options and uib logo.
-->
<template>
    <footer class="bg-opsi-blue text-white h-12 flex items-center justify-between px-6 text-sm">
        <a :href="uibLink" target="_blank" rel="noopener noreferrer">
            <CoreAppImage src="~/assets/images/uib-logo-wide-dark.svg" alt="uib GmbH Logo" image-class="h-7" />
        </a>
        <div class="flex items-center gap-2">
            <SettingsThemeToggle />
            <SettingsLanguageDropdown direction="up" />
        </div>
        <span class="opacity-80">v{{ version }}</span>
    </footer>
</template>

<script setup lang="ts">
defineProps<{
    version: string
    uibLink: string
}>()
</script>
