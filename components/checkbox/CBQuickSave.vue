<template>
  <b-form-checkbox
    v-model="localquicksave"
    data-testid="CBQuickSave"
    switch
    @change="changeSaveMode(localquicksave)"
  >
    <span class="sr-only">{{ localquicksave ? 'Enable Quick save': 'Disable Quick save' }}</span>
  </b-form-checkbox>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const settings = namespace('settings')

@Component
export default class CBQuickSave extends Vue {
  localquicksave: boolean = false

  @settings.Getter public quicksave!: boolean
  @settings.Mutation public setQuicksave!: (isQuicksave: boolean) => void

  beforeMount () {
    this.localquicksave = this.quicksave
  }

  changeSaveMode (isQuickSave: boolean) {
    this.localquicksave = isQuickSave
    this.setQuicksave(isQuickSave)
  }
}
</script>
