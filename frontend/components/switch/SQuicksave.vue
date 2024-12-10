<template>
  <TooltipTTooltip>
    <template #tooltip>
      {{ $t('form.quicksave.cbvalue.tooltip') }}
    </template>
    <template #default>
      <PFloatLabel v-if="props.type === 'checkbox'" variant="in">
        <PToggleSwitch
          v-model="cbValue"
          id="cbQuicksave"
          name="quicksave"
          :aria-label="
            'Switch quicksave mode. Currently is ' + (cbValue ? 'on' : 'off')
          "
          style="--p-toggleswitch-width: 5rem"
          v-bind="$props"
          @change="changeSelectionMode"
        />
        <label
          for="cbQuicksave"
          class="text-xs text-white !pb-1"
          :class="cbValue ? '' : 'pl-4'"
          >{{
            cbValue
              ? $t('form.quicksave.cbvalue.on')
              : $t('form.quicksave.cbvalue.off')
          }}</label
        >
      </PFloatLabel>
    </template>
  </TooltipTTooltip>
</template>

<script setup lang="ts">
  const $t = useI18n().t

  const settings = storeSettings()
  const changes = storeChanges()

  const emit = defineEmits(['action'])
  const props = defineProps({
    type: { type: String, default: 'checkbox' },
  })

  const cbValue = computed({
    get: () => settings.quicksave,
    set: () => {},
  })

  const changeSelectionMode = () => {
    if (settings.quicksave === false) {
      if (
        changes.changesHostParam.length > 1 ||
        changes.changesProducts.length
      ) {
        showModal()
        return
      }
    }
    settings.setQuicksave(!settings.quicksave)
    emit('action') // optional !?
  }

  const showModal = () => {
    alert($t('form.quicksave.cbvalue.error'))
  }
</script>
