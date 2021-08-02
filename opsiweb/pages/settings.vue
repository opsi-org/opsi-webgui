<template>
  <div class="container-fluid">
    <b-tabs>
      <b-tab :title="$t('settingsPage.modules')" active>
        <ViewVModules />
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

<style>
</style>
