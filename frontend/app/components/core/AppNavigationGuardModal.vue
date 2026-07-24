<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppNavigationGuardModal - Modal guard preventing accidental navigation with unsaved changes.
-->
<template>
  <UModal
    v-model:open="model"
    :title="$t('unsaved.changes')"
    :ui="{ content: 'max-w-sm sm:max-w-2xl' }"
  >
    <template #body>
      <p class="text-sm">{{ $t('nav.navigateAway') }}</p>
    </template>
    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton variant="outline" color="primary" @click="$emit('cancel')">{{
          $t('nav.stayOnPage')
        }}</UButton>
        <UButton color="error" @click="$emit('confirm')">{{ $t('nav.leaveAnyway') }}</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  const { t: $t } = useI18n()

  const model = defineModel<boolean>({ default: false })

  defineEmits<{
    confirm: []
    cancel: []
  }>()
</script>
