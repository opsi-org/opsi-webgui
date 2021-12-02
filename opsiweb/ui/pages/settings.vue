<template>
  <div class="container-fluid">
    <!-- <b-tabs>
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
    </b-tabs> -->
    <b-row>
      <b-form-group>
        <b-form-radio-group
          v-model="selected"
          :options="options"
          plain
        />
      </b-form-group>
    </b-row>
    <b-row>
      <ViewVSettingsLocalSpecific v-if="selected=='localspecific'" />
      <ViewVModules v-if="selected=='modules'" />
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PSettings extends Vue {
  selected: string = 'localspecific'
  options: Array<object> = [
    { text: this.$t('settingsPage.localspecific'), value: 'localspecific' },
    { text: this.$t('settingsPage.modules'), value: 'modules' }
  ]
}
</script>

<style>
</style>
