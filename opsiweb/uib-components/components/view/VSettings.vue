<template>
  <b-tabs data-testid="VSettings" small lazy>
    <!-- <b-tab active>
      <template #title>
        <span class="localspecific"> {{ $t('form.general') }} </span>
      </template>
      <ViewVSettingsLocalSpecific class="mt-2" />
    </b-tab> -->
  </b-tabs>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VSettings extends Vue {
}
</script>
