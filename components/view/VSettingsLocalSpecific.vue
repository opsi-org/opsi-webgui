<template>
  <div data-testid="VSettingsLocalSpecific" :class="'VSettingsLocalSpecific '+ $mq">
    <b-row class="mb-4">
      <b-col class="text-sm-right leftcol" cols="4">
        {{ $t('settingsPage.theme') }}
      </b-col>
      <b-col class="rightcol" col="*">
        <DropdownDDTheme />
      </b-col>
    </b-row>
    <b-row class="mb-4">
      <b-col class="text-sm-right leftcol" cols="4">
        <ButtonBTNHelp id="expert-help" />
        {{ $t('settingsPage.mode') }}
        <TooltipTTHelpExpert target="expert-help" />
      </b-col>
      <b-col class="rightcol" col="*">
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

<style>
.VSettingsLocalSpecific .rightcol{
  width:100%;
  min-width:100px;
}
.VSettingsLocalSpecific .leftcol {
  min-width: 200px;
}
</style>
