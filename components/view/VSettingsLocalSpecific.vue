<template>
  <div data-testid="VSettingsLocalSpecific" :class="'VSettingsLocalSpecific '+ $mq">
    <GridGFormItem v-once>
      <template #label>
        <span class="theme">{{ $t('form.theme') }}</span>
      </template>
      <template #value>
        <DropdownDDTheme />
      </template>
    </GridGFormItem>
    <GridGFormItem v-once data-testid="quicksave">
      <template #label>
        <ButtonBTNHelp id="savemode-help" />
        <span class="quicksave">{{ $t('form.quicksave') }}</span>
        <TooltipTTHelp id="savemode-help" :tooltip-content="helpSavemode" type="table" />
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
      { '  ': this.$t('label.on'), ' ': this.$t('description.quicksave.on') },
      { '  ': this.$t('label.off'), ' ': this.$t('description.quicksave.off') }
    ]
  }
}
</script>
