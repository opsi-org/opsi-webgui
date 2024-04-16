<template>
  <el-dropdown>
    <el-button class="ml-3">
      <IconIIcon :icon="icon.menu" :title="$t('button.tablerow.moreoptions')" />
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <div v-for="action in clientActions" :key="action" :data-testid="`client-action-${action}`">
          <el-popover trigger="click" placement="auto" :width="mq.isMobile.value ? '100%': '360px'">
            <template #reference>
              <el-button size="small" class="w-100"><IconIIcon :icon="icon[action]" class="mr-1" /> {{ $t('label.'+action) }} </el-button>
            </template>
            <el-form label-position="top" class="mt-3">
              <el-button
                class="float-right"
                type="success"
                :data-testid="`popover-${action}`"
              >
              {{ $t('label.'+action) }}
              </el-button>
            </el-form>
          </el-popover>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useIcons } from '@/composables/mixins/useIcons'
const icon = useIcons()
const mq = useMQ()
const props = defineProps({
  clientId: { type: String, default: '' }
})
const clientActions = ref([ 'ondemand', 'notify', 'reboot', 'deployclientagent', 'rename', 'delete' ])
</script>
