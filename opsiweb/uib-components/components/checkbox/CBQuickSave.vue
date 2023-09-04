<template>
  <div>
    <AlertAAlertLocal
      v-if="(changesProducts.filter(o => o.user === username).length>0 || changesHostParam.filter((o) => o.user === username).length>0 )&& !quicksave"
      show
      variant="warning"
      class="quickpanelwarning"
    >
      <span class="text-small">{{ $t('message.error.unsavedChanges') }}</span>
    </AlertAAlertLocal>
    <div v-else class="d-flex flex-nowrap justify-content-center border">
      <b-form-checkbox
        v-model="localquicksave"
        data-testid="CBQuickSave"
        switch
        class="pt-1"
        size="sm"
        @change="changeSaveMode(localquicksave)"
      >
        <span class="sr-only">{{ localquicksave ? $t('form.quicksave.enable'): $t('form.quicksave.disable') }}</span>
        <span class="text-small">{{ $t('form.quicksave') }}</span>
        <b-icon
          id="quicksavehelp"
          data-testid="ButtonBTNHelp"
          :icon="icon.help"
          type="help"
          font-scale="0.9"
        />
      </b-form-checkbox>
      <b-tooltip target="quicksavehelp" data-testid="TTHelp">
        <span v-for="item, index in helpSavemode" :key="index">
          <GridGFormItem :label="item.label" :value="item.description" variant="longvalue" />
        </span>
        <span class="text-small">{{ $t('note.quicksave') }}</span>
      </b-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Icons } from '../../mixins/icons'
const settings = namespace('settings')
const auth = namespace('auth')
const changes = namespace('changes')

@Component({ mixins: [Icons] })
export default class CBQuickSave extends Vue {
  icon: any
  $t: any
  localquicksave: boolean = false

  @settings.Getter public quicksave!: boolean
  @settings.Mutation public setQuicksave!: (isQuicksave: boolean) => void
  @auth.Getter public username!: string
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Getter public changesHostParam!: Array<ChangeObj>

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
<style>
.quickpanelwarning {
  line-height: 0.9;
}
</style>
