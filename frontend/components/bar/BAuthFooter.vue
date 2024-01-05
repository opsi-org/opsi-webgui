<template>
  <el-footer class="bg-secondary p-0 max-h-10">
    <el-row class="row-bg bg-primary ml-0 h-100 pl-2 pr-2" justify="space-between">
      <el-col :span="3" class="flex items-stretch">
        <el-text class="text-xs">{{ staticStrings.t_fixed('uib') }}</el-text>
      </el-col>
      <el-col :span="3" class="flex justify-center">
        <DropdownDDLang :footer="true" /><DropdownDDTheme />
      </el-col>
      <el-col :span="4" class="flex justify-end space-x-1">
        <el-text class="text-xs">{{ $t('label.version') }}</el-text>
        <el-text class="text-xs">{{ $config.public.packageVersion }}</el-text>
      </el-col>
    </el-row>
  </el-footer>
</template>

<script setup lang="ts">
import { useStrings } from "@/composables/mixins/useStrings"
const staticStrings = useStrings()
const $config = useRuntimeConfig()
const mq = useMQ()

</script>
<style scoped>
</style>