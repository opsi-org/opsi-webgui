<template>
  <div>
    <AlertAAlertLocal
      v-if="(changesProducts.filter(o => o.user === username).length>0 || changesHostParam.filter((o) => o.user === username).length>0 )&& !quicksave"
      show
      variant="danger"
    >
      <span class="text-smaller">{{ $t('message.error.unsavedChanges') }}</span>
    </AlertAAlertLocal>
    <div v-else class="d-flex flex-nowrap">
      <b-form-checkbox
        v-model="localquicksave"
        data-testid="CBQuickSave"
        switch
        size="sm"
        @change="changeSaveMode(localquicksave)"
      >
        <span class="sr-only">{{ localquicksave ? $t('form.quicksave.enable'): $t('form.quicksave.disable') }}</span>
        <span class="text-small">{{ $t('form.quicksave') }}</span>
      </b-form-checkbox>
      <ButtonBTNHelp id="savemode-help" />
      <TooltipTTHelp id="savemode-help" :tooltip-content="helpSavemode" type="grid" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
const settings = namespace('settings')
const auth = namespace('auth')
const changes = namespace('changes')

@Component
export default class CBQuickSave extends Vue {
  localquicksave: boolean = false

  @settings.Getter public quicksave!: boolean
  @settings.Mutation public setQuicksave!: (isQuicksave: boolean) => void
  @auth.Getter public username!: string
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Getter public changesHostParam!: Array<ChangeObj>
  $t: any

  beforeMount () {
    this.localquicksave = this.quicksave
  }

  changeSaveMode (isQuickSave: boolean) {
    this.localquicksave = isQuickSave
    this.setQuicksave(isQuickSave)
  }

  get helpSavemode () {
    return [
      { label: this.$t('label.on'), description: this.$t('description.quicksave.on') },
      { label: this.$t('label.off'), description: this.$t('description.quicksave.off') }
    ]
  }
}
</script>
