<template>
  <div data-testid="VSettingsLocalSpecific" :class="'VSettingsLocalSpecific '+ $mq">
    <b-row>
      <b-col>
        <DropdownDDLang v-once />
      </b-col>
      <b-col>
        <DropdownDDTheme v-once />
      </b-col>
      <b-col cols="5">
        <CheckboxCBQuickSave />
      </b-col>
      <!-- <GridGFormItem v-once data-testid="quicksave" variant="longlabel">
        <template #label>
          <span class="quicksave">{{ $t('form.quicksave') }}</span>
          <ButtonBTNHelp id="savemode-help" />
          <TooltipTTHelp id="savemode-help" :tooltip-content="helpSavemode" type="grid" />
        </template>
        <template #value>
          <CheckboxCBQuickSave />
        </template>
      </GridGFormItem> -->
    </b-row>

    <!-- <GridGFormItem v-once :label="$t('button.lang.tooltip')" variant="longlabel">
      <template #value>
        <DropdownDDLang v-once />
      </template>
    </GridGFormItem>
    <GridGFormItem v-once :label="$t('button.theme.tooltip')" variant="longlabel">
      <template #value>
        <DropdownDDTheme v-once />
      </template>
    </GridGFormItem>
    <GridGFormItem v-once data-testid="quicksave" variant="longlabel">
      <template #label>
        <span class="quicksave">{{ $t('form.quicksave') }}</span>
        <ButtonBTNHelp id="savemode-help" />
        <TooltipTTHelp id="savemode-help" :tooltip-content="helpSavemode" type="grid" />
      </template>
      <template #value>
        <CheckboxCBQuickSave />
      </template>
    </GridGFormItem> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VSettingsLocalSpecific extends Vue {
  $mq: any
  $t: any
  // get helpSavemode () {
  //   return [
  //     { label: this.$t('label.on'), description: this.$t('description.quicksave.on') },
  //     { label: this.$t('label.off'), description: this.$t('description.quicksave.off') }
  //   ]
  // }
}
</script>
