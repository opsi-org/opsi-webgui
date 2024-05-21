<template>
  <el-footer class="bg-primary max-h-10 footer-container" data-testid="BAuthFooter">
    <div class="footer-item items-stretch">
      <el-text class="text-on-primary">{{ staticStrings.t_fixed('uib') }}</el-text>
    </div>
    <div class="footer-item justify-center space-x-2">
      <FormitemDDLang :footer="true" />
      <FormitemDDTheme />
    </div>
    <div class="footer-item justify-end space-x-1">
      <el-text class="text-on-primary">{{ $t('label.version') }}</el-text>
      <el-text class="text-on-primary BAuthFooter-version">{{ $config.public.packageVersion }}</el-text>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { useStrings } from "@/composables/mixins/useStrings"
const staticStrings = useStrings()
const $config = useRuntimeConfig()
const mq = useMQ()
</script>

<style scoped>
.footer-container {
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  height: 100%;
  background-color: var(--primary-color);
}
.footer-item {
  display: flex;
  align-items: center;
}
</style>