<template>
  <div data-testid="VSettingsLocalSpecific">
    <div>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('settingsPage.theme') }}
        </b-col>
        <b-col>
          <DropdownDDTheme />
        </b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          <ButtonBTNHelp id="expert-help" />
          {{ $t('settingsPage.mode') }}
          <TooltipTTHelpExpert target="expert-help" />
        </b-col>
        <b-col>
          <ButtonBTNExpertMode />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VSettingsLocalSpecific extends Vue {
}
</script>
