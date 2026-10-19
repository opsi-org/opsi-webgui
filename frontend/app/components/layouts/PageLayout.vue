<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  LayoutsPageLayout - Standard page layout with optional split-view detail panel.
-->
<template>
  <div class="page-layout h-full min-h-0 min-w-0 max-h-full overflow-hidden">
    <DefineMain>
      <div class="flex flex-col h-full min-h-0 min-w-0">
        <div class="page-header shrink-0 pb-1.5">
          <div v-if="showControlsRow" class="flex flex-wrap items-center justify-between gap-1.5">
            <div class="flex items-center gap-2">
              <slot name="tabs" />
              <slot name="filters" />
            </div>
            <div class="flex flex-wrap items-center gap-1.5">
              <CoreAppFilterInput
                v-if="showFilter"
                v-model="searchModel"
                :placeholder="searchPlaceholder || $t('common.filter')"
                size="sm"
              />
              <slot name="tableControls" />
              <slot name="actions" />
              <slot name="saveActions" />
              <CoreAppTooltip v-if="showRefresh && changesDetected" :text="changesDescription">
                <CoreAppButton
                  :icon="icons.refresh"
                  color="warning"
                  variant="soft"
                  size="sm"
                  :loading="loading"
                  data-testid="page-refresh-button"
                  :aria-label="String($t('bus.changes'))"
                  @click="$emit('refresh')"
                >
                  <span class="hidden sm:inline">{{ $t('bus.changes') }}</span>
                </CoreAppButton>
              </CoreAppTooltip>
              <CoreAppButton
                v-else-if="showRefresh"
                :icon="icons.refresh"
                color="primary"
                variant="outline"
                size="sm"
                :loading="loading"
                :title="String($t('common.refresh'))"
                data-testid="page-refresh-button"
                @click="$emit('refresh')"
              />
            </div>
          </div>

          <div v-if="$slots.stats" class="mt-1 pt-1 border-t border-(--color-border)">
            <slot name="stats" />
          </div>
        </div>

        <div
          class="flex-1 min-h-0 overflow-y-auto min-w-0"
          :tabindex="allowXScroll ? 0 : undefined"
          :class="allowXScroll ? 'overflow-x-auto' : 'overflow-x-hidden'"
        >
          <slot />
        </div>
      </div>
    </DefineMain>
    <DefinePanel v-slot="{ body, overlay }">
      <div
        class="h-full min-h-0 min-w-0 bg-(--color-surface-elevated) border-l border-(--color-border) flex flex-col shadow-lg"
        data-testid="detail-panel"
      >
        <div
          class="shrink-0 sticky top-0 z-20 border-t border-b border-(--color-primary)/35 px-2.5 py-1.5 bg-(--color-surface-elevated) text-(--color-text) shadow-sm"
        >
          <div class="flex items-center gap-3 rounded-md px-1 transition-colors hover:bg-(--color-primary-soft-bg)">
            <CoreAppButton
              v-if="overlay"
              @click="$emit('close-panel')"
              variant="soft"
              color="primary"
              size="xs"
              :aria-label="String($t('common.back'))"
              :title="String($t('common.back'))"
            >
              <CoreAppIcon :name="icons.chevronLeft" class="w-3 h-3" />
            </CoreAppButton>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-x-1 min-w-0">
                <span class="font-semibold truncate m-0 text-sm">
                  <slot name="panel-title">{{ $t('common.details') }}</slot>
                </span>
                <span v-if="$slots['panel-subtitle']" class="text-xs text-(--color-text) truncate">
                  <slot name="panel-subtitle" />
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <slot name="panel-actions" />
              <CoreAppButton
                @click="$emit('close-panel')"
                variant="soft"
                color="primary"
                size="xs"
                :aria-label="String($t('common.close'))"
                :title="String($t('common.close'))"
              >
                <CoreAppIcon :name="icons.x" class="w-3 h-3" />
              </CoreAppButton>
            </div>
          </div>
        </div>
        <div
          tabindex="0"
          data-testid="detail-panel-content"
          class="flex-1 overflow-y-auto overflow-x-auto p-1.5 bg-(--color-surface) min-h-0 min-w-0 max-w-full"
        >
          <component :is="body" v-if="body" />
          <slot v-else name="panel" />
        </div>
      </div>
    </DefinePanel>
    <DefineSplit v-slot="{ panels }">
      <div ref="containerRef" class="h-full min-h-0 min-w-0">
        <USplitter
          v-if="width > 0"
          ref="splitter"
          :id="splitId"
          :items="getItems(panels)"
          :disabled="!handlesReady"
          class="h-full min-h-0"
          :ui="{
            panel: 'flex-col min-h-0 min-w-0',
            handle: isOverlay(panels)
              ? 'hidden'
              : 'z-10 w-2 -mx-1 shrink-0 hover:bg-opsi-blue/30 focus-visible:outline-2 focus-visible:outline-opsi-blue',
          }"
          @layout="updateLayout($event, panels)"
          @dragging="
            (_index, dragging) => {
              if (!dragging) saveLayout(panels)
            }
          "
          @keyup="saveKeyboard($event, panels)"
        >
          <template v-for="pane in panels" :key="pane.key" #[pane.key]>
            <component :is="pane.view" :body="pane.body" :overlay="isOverlay(panels)" />
          </template>
          <template #resize-handle>
            <span class="w-0.5 h-12 bg-(--color-border) rounded" />
          </template>
        </USplitter>
      </div>
    </DefineSplit>
    <slot name="workspace" :main="ReuseMain" :panel="ReusePanel" :split="ReuseSplit">
      <ReuseSplit :panels="[{ key: `${panelKey}-main`, view: ReuseMain }, ...(showPanel ? [{ key: panelKey, view: ReusePanel }] : [])]" />
    </slot>
  </div>
</template>

<script setup lang="ts">
  import { createReusableTemplate, useElementSize } from '@vueuse/core'
  import type { Component } from 'vue'
  import { useUiStore } from '~/stores/uiStore'

  interface Pane {
    key: string
    view: Component
    body?: Component
  }
  const [DefineMain, ReuseMain] = createReusableTemplate({ inheritAttrs: false })
  const [DefinePanel, ReusePanel] = createReusableTemplate<{ body?: Component; overlay?: boolean }>({ inheritAttrs: false })
  const [DefineSplit, ReuseSplit] = createReusableTemplate<{ panels: Pane[] }>()
  const props = withDefaults(
    defineProps<{
      showFilter?: boolean
      searchPlaceholder?: string
      showRefresh?: boolean
      loading?: boolean
      modelValue?: string
      showPanel?: boolean
      panelKey?: string
      defaultPanelWidthPercent?: number
      allowXScroll?: boolean
      changesDetected?: boolean
      changesDescription?: string
    }>(),
    {
      panelKey: 'detail',
      defaultPanelWidthPercent: 50,
    },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    refresh: []
    'close-panel': []
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()

  const showControlsRow = computed(
    () =>
      props.showFilter ||
      props.showRefresh ||
      !!useSlots().tabs ||
      !!useSlots().filters ||
      !!useSlots().actions ||
      !!useSlots().tableControls ||
      !!useSlots().saveActions,
  )

  const searchModel = computed({
    get: () => props.modelValue || '',
    set: (value: string) => emit('update:modelValue', value),
  })

  const containerRef = ref<HTMLElement | null>(null)
  const { width } = useElementSize(containerRef)
  const splitId = useId()
  const uiStore = useUiStore()
  const splitter = ref<{ panelsRef: { resize: (size: number) => void }[] } | null>(null)
  let lastLayout: number[] = []
  const handlesReady = ref(false)
  function updateLayout(layout: number[], panels: Pane[]) {
    if (layout.length !== lastLayout.length) {
      handlesReady.value = false
      void nextTick(() => {
        if (panels.length > 1 && lastLayout.length === panels.length && !isOverlay(panels)) {
          getItems(panels).forEach((item, index) => splitter.value?.panelsRef[index]?.resize(item.defaultSize))
        }
        handlesReady.value = true
      })
    }
    lastLayout = layout
  }
  const isOverlay = (panels: Pane[]) => width.value < panels.length * 280
  function getItems(panels: Pane[]) {
    const outer =
      uiStore.panelWidths[props.panelKey] ??
      (width.value * (uiStore.layout.detailPanelWidthPercent ?? props.defaultPanelWidthPercent)) / 100
    const right = uiStore.panelWidths[panels[2]?.key ?? ''] ?? outer / 2
    const sizes = panels.length === 3 ? [width.value - outer, outer - right, right] : [width.value - outer, outer]
    return panels.map((pane, index) => ({
      id: `${splitId}-${pane.key}`,
      order: index,
      slot: pane.key,
      class: isOverlay(panels) && index < panels.length - 1 ? 'hidden' : undefined,
      sizeUnit: 'px' as const,
      minSize: isOverlay(panels) ? 0 : 280,
      defaultSize: sizes[index] ?? width.value,
    }))
  }

  function saveLayout(panels: Pane[]) {
    if (isOverlay(panels) || lastLayout.length !== panels.length) return
    uiStore.$patch((state) => {
      panels.slice(1).forEach((pane, index) => {
        state.panelWidths[pane.key] = lastLayout.slice(index + 1).reduce((sum, size) => sum + size, 0)
      })
    })
  }

  function saveKeyboard(event: KeyboardEvent, panels: Pane[]) {
    if (
      ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) &&
      (event.target as HTMLElement).getAttribute('role') === 'separator'
    ) {
      void nextTick(() => saveLayout(panels))
    }
  }
</script>
