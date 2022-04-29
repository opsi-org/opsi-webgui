<template>
  <div class="container-fluid">
    <b-tabs>
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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PSettings extends Vue {
}
</script>
