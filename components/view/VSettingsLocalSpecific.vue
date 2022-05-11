<template>
  <div data-testid="VSettingsLocalSpecific" :class="'VSettingsLocalSpecific '+ $mq">
    <b-row class="mb-2">
      <b-col cols="2" class="text-sm-right">
        {{ $t('form.theme') }}
      </b-col>
      <b-col col="*">
        <DropdownDDTheme />
      </b-col>
    </b-row>
    <b-row class="mb-2">
      <b-col cols="2" class="text-sm-right">
        <ButtonBTNHelp id="expert-help" />
        {{ $t('form.quicksave') }}
        <TooltipTTHelpExpert target="expert-help" />
      </b-col>
      <b-col col="*">
        <CheckboxCBQuickSave />
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
