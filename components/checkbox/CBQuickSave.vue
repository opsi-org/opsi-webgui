<template>
  <div>
    <b-alert v-if="changesProducts.filter(o => o.user === username).length>0 && !quicksave" show variant="danger">
      {{ $t('message.error.unsavedChanges') }}
    </b-alert>
    <b-form-checkbox
      v-else
      v-model="localquicksave"
      data-testid="CBQuickSave"
      switch
      @change="changeSaveMode(localquicksave)"
    >
      <span class="sr-only">{{ localquicksave ? $t('form.quicksave.enable'): $t('form.quicksave.disable') }}</span>
    </b-form-checkbox>
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
  $t: any

  beforeMount () {
    this.localquicksave = this.quicksave
  }

  changeSaveMode (isQuickSave: boolean) {
    this.localquicksave = isQuickSave
    this.setQuicksave(isQuickSave)
  }
}
</script>
