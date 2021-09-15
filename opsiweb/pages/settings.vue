<template>
  <div class="container-fluid">
    <b-tabs :horizontal="true">
      <b-tab :title="$t('settingsPage.localspecific')" active>
        <ViewVSettingsLocalSpecific />
      </b-tab>
      <b-tab :title="$t('settingsPage.modules')">
        <DivDScrollResult>
          <template slot="content">
            <ViewVModules />
          </template>
        </DivDScrollResult>
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
