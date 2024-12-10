<template>
  <div data-testid="TCInstallationStatus">
    <el-tag
      v-if="props.text == 'mixed'"
      data-testid="TCInstallationStatusBadge"
      :type="props.variant"
    >
      <IconIIcon :icon="icons.unequal" alt="mixed" :title="props.text" />
    </el-tag>
    <el-tag
      v-else-if="props.text == 'installed'"
      data-testid="TCInstallationStatusBadge"
      type="success"
    >
      <span class="h6">
        <IconIIcon :icon="icons.client" alt="installed" :title="props.text" />
      </span>
    </el-tag>
    <el-tag
      v-else-if="props.text == 'unknown'"
      data-testid="TCInstallationStatusBadge"
      type="warning"
    >
      <span class="h6">
        <IconIIcon
          :icon="icons.productInstallationStatusUnknown"
          :alt="props.text"
        />
      </span>
    </el-tag>
    <el-tag
      v-else-if="
        $mq == 'mobile' &&
        (props.text == 'not_installed' ||
          props.text == '' ||
          props.text == 'none')
      "
      data-testid="TCInstallationStatusBadge"
      :type="undefined"
    >
      <!-- transparent-->
      <span class="h6">
        {{ $mq == 'mobile' ? t_fixed('keep-english.empty') : '' }}
      </span>
    </el-tag>
    <div
      v-else-if="
        $mq != 'mobile' &&
        (props.text == 'not_installed' ||
          props.text == '' ||
          props.text == 'none')
      "
      data-testid="TCInstallationStatusBadge"
      :type="undefined"
    >
      <!-- transparent -->
    </div>
    <el-tag
      v-else
      data-testid="TCInstallationStatusBadge"
      :type="props.variant"
    >
      <!-- mixed -->
      <span class="h6"> {{ props.text }} </span>
    </el-tag>
  </div>
</template>

<script lang="ts" setup>
  import { useIcons } from '~/composables/mixins/useIcons'
  import { useStrings } from '~/composables/mixins/useStrings'
  import type { ElTypeVariant } from '~/types/LibComponentTypes'

  const icons = useIcons()
  const { t_fixed } = useStrings()
  const $mq = useMQ().$mq

  const props = defineProps({
    text: { type: String, default: '' },
    variant: { type: String as PropType<ElTypeVariant>, default: 'warning' },
  })
</script>
