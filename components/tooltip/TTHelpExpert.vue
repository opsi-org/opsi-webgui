<template>
  <div data-testid="TTHelpExpert">
    <b-tooltip :target="target" variant="light">
      <b> {{ $t('settingsPage.mode') }} </b>
      <b-row class="text-left">
        <b-col>
          {{ $t('userinfo.normal') }}:
        </b-col>
        <b-col>
          {{ $t('userinfo.normal_desc') }}
        </b-col>
      </b-row>
      <b-row class="text-left">
        <b-col>
          {{ $t('userinfo.expert') }}:
        </b-col>
        <b-col>
          {{ $t('userinfo.expert_desc') }}
        </b-col>
      </b-row>
    </b-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TTHelpExpert extends Vue {
   @Prop({ }) target!: string
}
</script>
<style>
</style>
