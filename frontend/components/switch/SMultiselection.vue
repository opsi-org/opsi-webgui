<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <p-float-label
    v-if="props.type === 'checkbox'"
    variant="in"
    class="min-w-full"
    :title="$t('selectionMode')"
  >
    <p-toggle-switch
      :key="componentKeyForceUpdate"
      v-model="cbValue"
      ref="cbMultiSelection"
      id="cbMultiSelection"
      name="multiselection"
      aria-label="Multiselection mode"
      style="--p-toggleswitch-width: 5rem"
      v-bind="$props"
      @change="() => changeSelectionMode(true)"
    />
    <label for="cbMultiSelection" class="text-xs text-white !pb-1" :class="cbValue ? '' : 'pl-4'">{{
      cbValue ? $t('multi') : $t('single')
    }}</label>
  </p-float-label>
</template>

<script setup lang="ts">
  const $t = useI18n().t
  const selections = storeSelections()

  const componentKeyForceUpdate = ref(0)
  const emit = defineEmits(['action'])
  const props = defineProps({
    type: { type: String, default: 'checkbox' },
  })
  const cbMultiSelection = ref()
  const cbValue = computed({
    get: () => selections.multiSelection,
    set: (val) => {
      if (val) selections.setMultiSelection(val)
      else selections.setMultiSelection(!selections.multiSelection)
    },
  })

  watch(
    () => selections.multiSelection,
    (val) => {
      if (val !== true) {
        if (selections.selectionDepots.length > 1) {
          selections.setSelectionDepots([selections.selectionDepots[0]])
        }
        if (selections.selectionClients.length > 1) {
          selections.setSelectionClients([selections.selectionClients[0]])
        }
        if (selections.selectionProducts.length > 1) {
          selections.setSelectionProducts([selections.selectionProducts[0]])
        }
      }
    }
  )

  const changeSelectionMode = (showModalVal = true) => {
    if (
      showModalVal &&
      selections.multiSelection === true &&
      (selections.selectionDepots.length > 1 ||
        selections.selectionClients.length > 1 ||
        selections.selectionProducts.length > 1)
    ) {
      showModal()
      return
    }
    selections.setMultiSelection(!selections.multiSelection)
    emit('action')
  }

  const showModal = async () => {
    if (confirm($t('message.multipleItemsSelected'))) {
      selections.setMultiSelection(false)
    } else {
      selections.setMultiSelection(true)
      componentKeyForceUpdate.value += 1
    }
  }
</script>
