<template>
  <b-tabs data-testid="VSettings" lazy>
    <b-tab active>
      <template #title>
        <span class="localspecific"> {{ $t('form.general') }} </span>
      </template>
      <b-card>
        <ViewVSettingsLocalSpecific />
      </b-card>
    </b-tab>
    <b-tab>
      <template #title>
        <span class="opsispecific"> {{ $t('form.opsi') }} </span>
      </template>
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
