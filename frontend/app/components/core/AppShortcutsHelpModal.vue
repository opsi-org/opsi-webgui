<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppShortcutsHelpModal - Overview of available keyboard shortcuts.
-->
<template>
  <CoreAppModal
    v-model:open="model"
    :title="$t('shortcuts.title')"
    :ui="{ content: 'w-[94vw] max-w-2xl h-auto max-h-[85vh]', body: 'overflow-hidden' }"
  >
    <template #body>
      <div class="space-y-3 overflow-y-auto max-h-[70vh] pr-1" :tabindex="0" role="region" :aria-label="$t('shortcuts.title')">
        <div v-for="group in shortcutGroups" :key="group.title">
          <CoreAppHeading tag="h3" size="xs" :text="group.title" class="mb-1 normal-case" />
          <ul class="space-y-0.5">
            <li
              v-for="item in group.items"
              :key="item.description"
              class="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-sm transition-colors hover:bg-(--color-surface-hover) focus-within:bg-(--color-surface-hover)"
            >
              <span class="min-w-0 truncate text-(--color-text)">{{ item.description }}</span>
              <span class="flex shrink-0 items-center gap-0.5">
                <template v-for="(key, index) in item.keys" :key="key">
                  <kbd
                    class="rounded border border-(--color-border) bg-(--color-surface-hover) px-1 py-px text-[0.6875rem] leading-4 text-(--color-text)"
                    >{{ key }}</kbd
                  >
                  <span v-if="index < item.keys.length - 1" class="px-px text-[0.6875rem] text-(--color-text-muted)">/</span>
                </template>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </CoreAppModal>
</template>

<script setup lang="ts">
  const { t: $t } = useI18n()

  const model = defineModel<boolean>({ default: false })

  interface ShortcutItem {
    keys: string[]
    description: string
  }

  interface ShortcutGroup {
    title: string
    items: ShortcutItem[]
  }

  const shortcutGroups = computed<ShortcutGroup[]>(() => [
    {
      title: $t('shortcuts.global'),
      items: [
        { keys: ['Ctrl', 'S'], description: $t('shortcuts.save') },
        { keys: ['Ctrl', 'D'], description: $t('shortcuts.discard') },
        { keys: ['Ctrl', 'Shift', 'S'], description: $t('shortcuts.saveAndExecute') },
        { keys: ['Ctrl', 'Shift', 'Q'], description: $t('shortcuts.toggleQuickPanel') },
        { keys: ['Ctrl', 'Esc'], description: $t('shortcuts.closePanel') },
        { keys: ['Ctrl', 'Shift', '?'], description: $t('shortcuts.showShortcuts') },
      ],
    },
    {
      title: $t('shortcuts.table'),
      items: [
        { keys: ['Ctrl', 'Enter'], description: $t('shortcuts.openDetail') },
        { keys: ['Ctrl', 'R'], description: $t('shortcuts.refreshTable') },
        { keys: ['↑', '↓'], description: $t('shortcuts.navigateRows') },
        { keys: ['Ctrl', 'Space'], description: $t('shortcuts.selectRow') },
      ],
    },
    {
      title: $t('shortcuts.clientsTable'),
      items: [{ keys: ['Ctrl', 'Shift', 'N'], description: $t('shortcuts.addClient') }],
    },
    {
      title: $t('shortcuts.serversTable'),
      items: [{ keys: ['Ctrl', 'Shift', 'N'], description: $t('shortcuts.addServerConfig') }],
    },
    {
      title: $t('shortcuts.productsTable'),
      items: [{ keys: ['Ctrl', 'Shift', 'S'], description: $t('shortcuts.productsSaveAndExecute') }],
    },
    {
      title: $t('shortcuts.forms'),
      items: [{ keys: ['Ctrl', 'Enter'], description: $t('shortcuts.submitForm') }],
    },
  ])
</script>
