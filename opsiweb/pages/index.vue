<template>
  <b-card class="text-center index-card">
    <h1 class="title">
      {{ t_fixed("title.project") }}
    </h1>
    <IconIOpsiLogo
      :short="false"
      :light="themeclass === CONST_LIGHT"
      classes="w-100 index-opsi-logo"
    />
    <IconIUibLogo
      :short="false"
      :light="themeclass === CONST_LIGHT"
      classes="w-50 index-uib-logo"
    />
  </b-card>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Settings } from '../uib-components/mixins/settings'
import { Strings } from '../uib-components/mixins/strings'

@Component({ mixins: [Settings, Strings] })
export default class PIndex extends Vue {
  $t:any
  t_fixed:any // mixin string
  CONST_LIGHT!: string
  themeclass!: string
}
</script>

<style>
.index-card .index-opsi-logo {
  max-width: 700px;
}
.index-card .index-uib-logo {
  max-width: 400px;
}
.index-card .title {
  font-size: xx-large;
}
</style>
