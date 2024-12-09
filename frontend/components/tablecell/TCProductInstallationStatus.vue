<template>
  <div data-testid="TCInstallationStatus">
    <p-tag
      v-if="props.text == 'mixed'"
      data-testid="TCInstallationStatusBadge"
      :severity="props.variant"
    >
      <IconIIcon :icon="icons.unequal" alt="mixed" :title="props.text" />
    </p-tag>
    <p-tag
      v-else-if="props.text == 'installed'"
      data-testid="TCInstallationStatusBadge"
      severity="success"
    >
      <span class="h6">
        <IconIIcon :icon="icons.client" alt="installed" :title="props.text" />
      </span>
    </p-tag>
    <p-tag
      v-else-if="props.text == 'unknown'"
      data-testid="TCInstallationStatusBadge"
      severity="warn"
    >
      <span class="h6">
        <IconIIcon
          :icon="icons.productInstallationStatusUnknown"
          :alt="props.text"
        />
      </span>
    </p-tag>
    <p-tag
      v-else-if="
        $mq == 'mobile' &&
        (props.text == 'not_installed' ||
          props.text == '' ||
          props.text == 'none')
      "
      data-testid="TCInstallationStatusBadge"
      severity="secondary"
    >
      <!-- transparent-->
      <span class="h6">
        {{ $mq == 'mobile' ? t_fixed('keep-english.empty') : '' }}
      </span>
    </p-tag>
    <div
      v-else-if="
        $mq != 'mobile' &&
        (props.text == 'not_installed' ||
          props.text == '' ||
          props.text == 'none')
      "
      data-testid="TCInstallationStatusBadge"
      severity="secondary"
    >
      <!-- transparent -->
    </div>
    <p-tag
      v-else
      data-testid="TCInstallationStatusBadge"
      :severity="props.variant"
    >
      <!-- mixed -->
      <span class="h6"> {{ props.text }} </span>
    </p-tag>
  </div>
</template>

<script lang="ts" setup>
  import { useIcons } from '~/composables/mixins/useIcons'
  import { useStrings } from '~/composables/mixins/useStrings'
  import type { PSeverity } from '~/types/LibComponentTypes'

  const icons = useIcons()
  const { t_fixed } = useStrings()
  const $mq = useMQ().$mq

  const props = defineProps({
    text: { type: String, default: '' },
    variant: {
      type: String as PropType<PSeverity>,
      default: 'warn',
    },
  })
</script>
