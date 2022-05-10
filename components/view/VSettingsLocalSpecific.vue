<template>
  <div data-testid="VSettingsLocalSpecific" :class="'VSettingsLocalSpecific '+ $mq">
    <b-row class="mb-2">
      <b-col cols="2">
        {{ $t('form.theme') }}
      </b-col>
      <b-col col="*">
        <DropdownDDTheme />
      </b-col>
    </b-row>
    <b-row class="mb-2">
      <b-col cols="2">
        {{ $t('form.quicksave') }}
        <ButtonBTNHelp id="expert-help" />
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
