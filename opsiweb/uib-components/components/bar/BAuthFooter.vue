<template>
  <div class="fixed-bottom">
    <b-navbar
      toggleable="md"
      fixed="bottom"
      data-testid="BarBAuthFooter"
      variant="primary"
      :class="{auth_footer: $mq !== 'mobile', auth_footer_wrap: $mq === 'mobile'}"
    >
      <b-container fluid>
        <span class="text-small">{{ t_fixed('uib') }}</span>
        <DropdownDDLang :footer="true" />
        <span class="text-small BAuthFooter-version">
          {{ $t('label.version') }} {{ $config.packageVersion }}
        </span>
      </b-container>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Strings } from '../../mixins/strings'
import DropdownDDLang from '../dropdown/DDLang.vue'

@Component({ components: { DropdownDDLang }, mixins: [Strings] })
export default class BAuthFooter extends Vue {
  $mq: any
  $config: any
  t_fixed: any // mixin
}
</script>

<style>
.auth_footer{
  height: var(--height-navbar) !important;
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
