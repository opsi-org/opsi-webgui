<template>
  <DivDScrollResult>
    <template slot="content">
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('settingsPage.theme') }}:
        </b-col>
        <b-col>
          <DropdownDDTheme />
        </b-col>
      </b-row>
    </template>
  </DivDScrollResult>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VSettingsGeneral extends Vue {
}
</script>

<style>

</style>
