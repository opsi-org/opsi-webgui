<template>
  <div>
    <el-tooltip
      :content="$t('form.autorefresh.cbvalue.tooltip')"
      placement="top"
    >
      <el-switch
        v-if="props.type === 'checkbox'"
        v-model="msgbusAutoRefresh"
        inline-prompt
        :active-text="$t('form.autorefresh.cbvalue.on')"
        :inactive-text="$t('form.autorefresh.cbvalue.off')"
        size="large"
        v-bind="$props"
      />
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
  const $t = useI18n().t

  const { msgbusAutoRefresh } = storeToRefs(storeSettings())

  const props = defineProps({
    type: { type: String, default: 'checkbox' },
  })
</script>
