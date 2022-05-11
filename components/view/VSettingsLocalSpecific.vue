<template>
  <div data-testid="VSettingsLocalSpecific" :class="'VSettingsLocalSpecific '+ $mq">
    <GridGFormItem :label="$t('form.theme')">
      <template #value>
        <DropdownDDTheme />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <ButtonBTNHelp id="expert-help" />
        {{ $t('form.quicksave') }}
        <TooltipTTHelpExpert target="expert-help" />
      </template>
      <template #value>
        <CheckboxCBQuickSave />
      </template>
    </GridGFormItem>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VSettingsLocalSpecific extends Vue {
}
</script>
