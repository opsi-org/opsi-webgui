<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  AdminSystemInfo - System information display with key-value pairs and diagnostics data.
-->

<template>
  <CoreAppCard fill scrollable>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-heading uppercase tracking-wide m-0">
          {{ $t('diag.systemInfo') }}
        </h2>
      </div>
    </template>
    <div class="system-info-tree">
      <div v-if="loading" class="py-8 text-center">
        <CoreAppLoadingSpinner />
      </div>
      <template v-else>
        <!-- System properties node -->
        <div v-if="Object.keys(filteredSystemInfo).length > 0" class="tree-node">
          <div
            class="flex items-center gap-1.5 px-1.5 py-0.5 rounded cursor-pointer transition-colors hover:bg-(--color-surface-hover)"
            role="button"
            tabindex="0"
            :aria-label="`${$t('common.expand')} / ${$t('common.collapse')} ${$t('diag.systemProps')}`"
            @click="toggleNode('_system')"
            @keydown.enter="toggleNode('_system')"
            @keydown.space.prevent="toggleNode('_system')"
          >
            <span
              class="w-5! h-5! p-0! shrink-0 inline-flex items-center justify-center"
              :class="expanded['_system'] ? 'text-(--color-primary)' : 'text-(--color-text-muted)'"
              aria-hidden="true"
            >
              <CoreAppIcon
                :name="icons.chevronRight"
                class="w-3.5 h-3.5 transition-transform duration-200"
                :class="{ 'rotate-90': expanded['_system'] }"
              />
            </span>
            <span class="text-sm flex-1 truncate" :class="expanded['_system'] ? 'font-medium' : ''">
              {{ $t('diag.systemProps') }}
            </span>
            <span class="text-xs text-(--color-text-muted) opacity-60">{{
              Object.keys(filteredSystemInfo).length
            }}</span>
          </div>
          <div v-if="expanded['_system']" class="children-container">
            <div v-for="(value, key) in filteredSystemInfo" :key="key" class="tree-node">
              <div
                class="flex items-start gap-1.5 px-1.5 py-1 rounded transition-colors hover:bg-(--color-surface-hover) group/leaf"
                style="padding-left: 24px"
              >
                <span class="tree-guide-line" style="left: 8px" />
                <span class="w-5 flex items-center justify-center shrink-0 mt-0.5" />
                <div
                  class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4"
                >
                  <span
                    class="text-sm text-(--color-text) min-w-0 md:w-2/5 break-all truncate"
                    :title="String(key)"
                  >
                    {{ key }}
                  </span>
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <CoreAppBadge
                      v-if="typeof value === 'boolean'"
                      :color="value ? 'success' : 'neutral'"
                      variant="soft"
                      size="xs"
                    >
                      {{ value ? 'Yes' : 'No' }}
                    </CoreAppBadge>
                    <span v-else class="text-sm font-medium truncate leading-4" :title="String(value)">
                      {{ formatValue(value) }}
                    </span>
                    <CoreAppButton
                      color="primary"
                      variant="soft"
                      size="xs"
                      :icon="icons.copy"
                      class="opacity-0 group-hover/leaf:opacity-100 transition-opacity shrink-0"
                      @click.stop="$emit('copyToClipboard', String(value))"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Category nodes -->
        <template v-for="(values, category) in filteredDiagnosticsData" :key="category">
          <div
            v-if="
              typeof values === 'object' &&
              values !== null &&
              Object.keys(values as object).length > 0
            "
            class="tree-node"
          >
            <div
              class="flex items-center gap-1.5 px-1.5 py-0.5 rounded cursor-pointer transition-colors hover:bg-(--color-surface-hover)"
              role="button"
              tabindex="0"
              :aria-label="`${$t('common.expand')} / ${$t('common.collapse')} ${String(category)}`"
              @click="toggleNode(String(category))"
              @keydown.enter="toggleNode(String(category))"
              @keydown.space.prevent="toggleNode(String(category))"
            >
              <span
                class="w-5! h-5! p-0! shrink-0 inline-flex items-center justify-center"
                :class="
                  expanded[String(category)]
                    ? 'text-(--color-primary)'
                    : 'text-(--color-text-muted)'
                "
                aria-hidden="true"
              >
                <CoreAppIcon
                  :name="icons.chevronRight"
                  class="w-3.5 h-3.5 transition-transform duration-200"
                  :class="{ 'rotate-90': expanded[String(category)] }"
                />
              </span>
              <span
                class="text-sm flex-1 truncate"
                :class="expanded[String(category)] ? 'font-medium' : ''"
              >
                {{ String(category) }}
              </span>
              <span class="text-xs text-(--color-text-muted) opacity-60">{{
                Object.keys(values as object).length
              }}</span>
            </div>
            <div v-if="expanded[String(category)]" class="children-container">
              <template v-for="(v, k) in values as Record<string, unknown>" :key="k">
                <!-- Nested object child -->
                <div v-if="isComplexValue(v)" class="tree-node">
                  <div
                    class="flex items-center gap-1.5 px-1.5 py-0.5 rounded cursor-pointer transition-colors hover:bg-(--color-surface-hover)"
                    style="padding-left: 24px"
                    role="button"
                    tabindex="0"
                    :aria-label="`${$t('common.expand')} / ${$t('common.collapse')} ${String(k)}`"
                    @click="toggleNode(String(category) + '.' + String(k))"
                    @keydown.enter="toggleNode(String(category) + '.' + String(k))"
                    @keydown.space.prevent="toggleNode(String(category) + '.' + String(k))"
                  >
                    <span class="tree-guide-line" style="left: 8px" />
                    <span
                      class="w-5! h-5! p-0! shrink-0 inline-flex items-center justify-center"
                      :class="
                        expanded[String(category) + '.' + String(k)]
                          ? 'text-(--color-primary)'
                          : 'text-(--color-text-muted)'
                      "
                      aria-hidden="true"
                    >
                      <CoreAppIcon
                        :name="icons.chevronRight"
                        class="w-3.5 h-3.5 transition-transform duration-200"
                        :class="{ 'rotate-90': expanded[String(category) + '.' + String(k)] }"
                      />
                    </span>
                    <span
                      class="text-sm flex-1 truncate"
                      :class="expanded[String(category) + '.' + String(k)] ? 'font-medium' : ''"
                    >
                      {{ k }}
                    </span>
                    <span class="text-xs text-(--color-text-muted) opacity-60">
                      {{
                        typeof v === 'object' && v !== null ? Object.keys(v as object).length : ''
                      }}
                    </span>
                  </div>
                  <div
                    v-if="expanded[String(category) + '.' + String(k)]"
                    class="children-container"
                  >
                    <template v-if="Array.isArray(v)">
                      <div v-for="(item, idx) in v" :key="idx" class="tree-node">
                        <div
                          class="flex items-start gap-1.5 px-1.5 py-0.5 rounded transition-colors hover:bg-(--color-surface-hover)"
                          style="padding-left: 40px"
                        >
                          <span class="tree-guide-line" style="left: 8px" />
                          <span class="tree-guide-line" style="left: 24px" />
                          <span class="w-5 flex items-center justify-center shrink-0 mt-0.5" />
                          <span class="text-sm break-all">{{
                            typeof item === 'object' ? JSON.stringify(item) : String(item)
                          }}</span>
                        </div>
                      </div>
                    </template>
                    <template v-else-if="typeof v === 'object' && v !== null">
                      <div
                        v-for="(sv, sk) in v as Record<string, unknown>"
                        :key="sk"
                        class="tree-node"
                      >
                        <div
                          class="flex items-start gap-1.5 px-1.5 py-0.5 rounded transition-colors hover:bg-(--color-surface-hover) group/deep"
                          style="padding-left: 40px"
                        >
                          <span class="tree-guide-line" style="left: 8px" />
                          <span class="tree-guide-line" style="left: 24px" />
                          <span class="w-5 flex items-center justify-center shrink-0 mt-0.5" />
                          <div
                            class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4"
                          >
                            <span
                              class="text-sm text-(--color-text) min-w-0 md:w-2/5 break-all truncate"
                              :title="String(sk)"
                            >
                              {{ sk }}
                            </span>
                            <div class="flex items-center gap-2 flex-1 min-w-0">
                              <CoreAppBadge
                                v-if="typeof sv === 'boolean'"
                                :color="sv ? 'success' : 'neutral'"
                                variant="soft"
                                size="xs"
                              >
                                {{ sv ? 'Yes' : 'No' }}
                              </CoreAppBadge>
                              <span
                                v-else-if="typeof sv === 'object'"
                                class="text-xs break-all truncate max-w-full"
                                :title="JSON.stringify(sv)"
                              >
                                {{ JSON.stringify(sv) }}
                              </span>
                              <span v-else class="text-sm font-medium truncate leading-4" :title="String(sv)">
                                {{ formatValue(sv) }}
                              </span>
                              <CoreAppButton
                                color="primary"
                                variant="soft"
                                size="xs"
                                :icon="icons.copy"
                                class="opacity-0 group-hover/deep:opacity-100 transition-opacity shrink-0"
                                @click.stop="
                                  $emit(
                                    'copyToClipboard',
                                    typeof sv === 'object'
                                      ? JSON.stringify(sv, null, 2)
                                      : String(sv)
                                  )
                                "
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
                <!-- Simple leaf child -->
                <div v-else class="tree-node">
                  <div
                    class="flex items-start gap-1.5 px-1.5 py-0.5 rounded transition-colors hover:bg-(--color-surface-hover) group/leaf"
                    style="padding-left: 24px"
                  >
                    <span class="tree-guide-line" style="left: 8px" />
                    <span class="w-5 flex items-center justify-center shrink-0 mt-0.5" />
                    <div
                      class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4"
                    >
                      <span
                        class="text-sm text-(--color-text) min-w-0 md:w-2/5 break-all truncate"
                        :title="String(k)"
                      >
                        {{ k }}
                      </span>
                      <div class="flex items-center gap-2 flex-1 min-w-0">
                        <CoreAppBadge
                          v-if="typeof v === 'boolean'"
                          :color="v ? 'success' : 'neutral'"
                          variant="soft"
                          size="xs"
                        >
                          {{ v ? 'Yes' : 'No' }}
                        </CoreAppBadge>
                        <span v-else class="text-sm font-medium truncate leading-4" :title="String(v)">
                          {{ formatValue(v) }}
                        </span>
                        <CoreAppButton
                          color="primary"
                          variant="soft"
                          size="xs"
                          :icon="icons.copy"
                          class="opacity-0 group-hover/leaf:opacity-100 transition-opacity shrink-0"
                          @click.stop="
                            $emit(
                              'copyToClipboard',
                              typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)
                            )
                          "
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <div
          v-if="
            Object.keys(filteredSystemInfo).length === 0 &&
            Object.keys(filteredDiagnosticsData).length === 0
          "
          class="text-center py-8 text-(--color-text-muted)"
        >
          {{ filter ? $t('common.noResults') : $t('common.noData') }}
        </div>
      </template>
    </div>
  </CoreAppCard>
</template>

<script setup lang="ts">
  const { t: $t } = useI18n()
  const props = defineProps([
    'filteredSystemInfo',
    'filteredDiagnosticsData',
    'loading',
    'icons',
    'filter',
    'formatKey',
    'formatValue',
  ])
  defineEmits(['copyToClipboard'])

  const expanded = ref<Record<string, boolean>>({})

  function toggleNode(key: string) {
    expanded.value[key] = !expanded.value[key]
  }

  function isComplexValue(value: unknown): boolean {
    if (value === null || value === undefined) return false
    if (typeof value !== 'object') return false
    if (Array.isArray(value)) return true
    return Object.keys(value as object).length > 0
  }
</script>

<style scoped>
  .system-info-tree {
    user-select: none;
  }

  .tree-node {
    position: relative;
  }

  .children-container {
    position: relative;
  }

  .tree-guide-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: var(--color-border);
    opacity: 0.4;
    pointer-events: none;
  }
</style>
