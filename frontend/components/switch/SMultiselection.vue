<template>
  <TooltipTTooltip>
    <template #tooltip>
      {{ $t('form.multiselection.cbvalue.tooltip') }}
    </template>

    <template #default>
      <PFloatLabel
        v-if="props.type === 'checkbox'"
        variant="in"
        class="min-w-full border-1 border-red-500"
      >
        <PToggleSwitch
          v-model="cbValue"
          id="cbMultiSelection"
          name="multiselection"
          :aria-label="
            'Switch multiselection mode. Currently is ' +
            (cbValue ? 'on' : 'off')
          "
          style="--p-toggleswitch-width: 5rem"
          v-bind="$props"
          @change="changeSelectionMode"
        />
        <label
          for="cbMultiSelection"
          class="text-xs text-white !pb-1"
          :class="cbValue ? '' : 'pl-4'"
          >{{
            cbValue
              ? $t('form.multiselection.cbvalue.on')
              : $t('form.multiselection.cbvalue.off')
          }}</label
        >
      </PFloatLabel>
    </template>
  </TooltipTTooltip>
</template>

<script setup lang="ts">
  const $t = useI18n().t
  const selections = storeSelections()

  const emit = defineEmits(['action'])
  const props = defineProps({
    type: { type: String, default: 'checkbox' },
  })

  const cbValue = computed({
    get: () => selections.multiSelection,
    set: () => {},
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
    },
  )

  const changeSelectionMode = () => {
    if (selections.multiSelection === true) {
      if (
        selections.selectionDepots.length > 1 ||
        selections.selectionClients.length > 1 ||
        selections.selectionProducts.length > 1
      ) {
        showModal()
        return
      }
    }
    selections.setMultiSelection(!selections.multiSelection)
    emit('action')
  }

  const showModal = () => {
    alert($t('form.multiselection.cbvalue.error'))
  }
</script>
