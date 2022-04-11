<template>
  <div data-testid="VSettingsLocalSpecific">
    <b-row class="mb-4">
      <b-col class="text-sm-right" cols="2">
        {{ $t('settingsPage.theme') }}
      </b-col>
      <b-col>
        <DropdownDDTheme />
      </b-col>
    </b-row>
    <b-row class="mb-4">
      <b-col class="text-sm-right" cols="2">
        <ButtonBTNHelp id="expert-help" />
        {{ $t('settingsPage.mode') }}
        <TooltipTTHelpExpert target="expert-help" />
      </b-col>
      <b-col>
        <ButtonBTNExpertMode />
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VSettingsLocalSpecific extends Vue {
}
</script>
