<template>
  <el-footer class="bg-opsi-blue text-white max-h-10 flex justify-between p-4" data-testid="BAuthFooter">
    <div class="flex items-center">
      <el-text>{{ staticStrings.t_fixed('uib') }}</el-text>
    </div>
    <div class="flex justify-center items-center space-x-2">
      <FormitemDDLang :footer="true" />
      <FormitemDDTheme />
    </div>
    <div class="flex justify-end space-x-1">
      <el-text>{{ $t('label.version') }}</el-text>
      <el-text class="BAuthFooter-version">{{ $config.public.packageVersion }}</el-text>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
  import { useStrings } from '@/composables/mixins/useStrings'
  const staticStrings = useStrings()
  const $config = useRuntimeConfig()
  const mq = useMQ()
</script>
