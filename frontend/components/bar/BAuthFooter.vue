<template>
  <div class="fixed-bottom">
    <b-navbar
      toggleable="md"
      fixed="bottom"
      data-testid="BarBAuthFooter"
      variant="primary"
      :class="{auth_footer: mq.$mq !== 'mobile', auth_footer_wrap: mq.$mq === 'mobile'}"
    >
      <b-container fluid>
        <span class="text-small">{{ staticStrings.t_fixed('uib') }}</span>
        <DropdownDDLang :footer="true" />
        <span class="text-small BAuthFooter-version">
          {{ $t('label.version') }} {{ $config.packageVersion }}
        </span>
      </b-container>
    </b-navbar>
  </div>
</template>

<script setup>
import { useStrings } from "../../composables/mixins/useStrings"
const staticStrings = useStrings()
const $config = useRuntimeConfig()
const mq = useMQ()
// $config

// const props = defineProps({
//   footer: { type: Boolean, default: false}
// })
</script>
<style scoped>

.auth_footer{
  height: 50px !important;
}
.auth_footer > div{
  margin-left: 20px;
  margin-right: 20px;
}
.auth_footer_wrap {
  display: flex;
  flex-wrap: wrap;
}
</style>