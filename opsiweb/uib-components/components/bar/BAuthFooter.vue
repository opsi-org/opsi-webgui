<template>
  <div class="fixed-bottom">
    <b-navbar
      toggleable="md"
      fixed="bottom"
      data-testid="BarBAuthFooter"
      variant="primary"
      :class="{auth_footer: $mq === 'desktop', auth_footer_wrap: $mq === 'mobile'}"
    >
      <b-container fluid>
        <b-navbar-nav small>
          <b-nav-text>{{ $t('uib') }}</b-nav-text>
        </b-navbar-nav>
        <b-navbar-nav align="center" small class="ml-auto">
          <DropdownDDLang :dropup="true" />
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto" small>
          <b-nav-text class="BAuthFooter-version">
            {{ $t('label.version') }} {{ $config.packageVersion }}
          </b-nav-text>
        </b-navbar-nav>
      </b-container>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import DropdownDDLang from '../dropdown/DDLang.vue'
@Component({ components: { DropdownDDLang } })
export default class BAuthFooter extends Vue {
  $mq: any
  $config: any
}
</script>

<style>
.auth_footer{
  height: var(--height-navbar) !important;
}
.auth_footer_wrap {
  display: flex;
  flex-wrap: wrap;
}
</style>
