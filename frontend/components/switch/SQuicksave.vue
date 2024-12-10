<template>
  <div>
    <el-tooltip :content="$t('form.quicksave.cbvalue.tooltip')" placement="top">
      <el-switch
        v-if="props.type === 'checkbox'"
        v-model="cbValue"
        inline-prompt
        :active-text="$t('form.quicksave.cbvalue.on')"
        :inactive-text="$t('form.quicksave.cbvalue.off')"
        size="large"
        v-bind="$props"
        @change="changeSelectionMode"
      />
    </el-tooltip>
  </div>
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
