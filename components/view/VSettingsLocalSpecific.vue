<template>
  <div data-testid="VSettingsLocalSpecific" :class="'VSettingsLocalSpecific '+ $mq">
    <GridGFormItem :label="$t('form.theme')">
      <template #value>
        <DropdownDDTheme />
      </template>
    </GridGFormItem>
    <GridGFormItem data-testid="quicksave">
      <template #label>
        <ButtonBTNHelp id="savemode-help" />
        <span class="quicksave">{{ $t('form.quicksave') }}</span>
        <TooltipTTHelp id="savemode-help" :tooltip-content="helpSavemode" type="grid" />
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
  $t: any
  get helpSavemode () {
    return [
      { label: this.$t('label.on'), description: this.$t('description.quicksave.on') },
      { label: this.$t('label.off'), description: this.$t('description.quicksave.off') }
    ]
  }
}
</script>
