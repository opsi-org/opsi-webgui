<template>
  <b-tabs data-testid="VSettings">
    <b-tab :title="$t('form.localspecific')" active>
      <b-card>
        <ViewVSettingsLocalSpecific />
      </b-card>
    </b-tab>
    <b-tab :title="$t('form.modules')">
      <b-card>
        <ViewVModules />
      </b-card>
    </b-tab>
  </b-tabs>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VSettings extends Vue {
}
</script>
