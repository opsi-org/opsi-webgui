<template>
  <b-iconstack class="IExpert_Icon" @click="toggleExpertMode">
    <b-icon-star-fill v-if="localExpert" variant="light" shift-h="4" shift-v="5" class="IExpert_Icon_Star_filled" />
    <b-icon-star v-else variant="light" shift-h="4" shift-v="5" class="IExpert_Icon_Star" />
  </b-iconstack>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
const settings = namespace('settings')

@Component export default class IExpert extends Vue {
  @settings.Getter public expert!: boolean
  @settings.Mutation public setExpertmode!: (isExpert: boolean) => void

  get localExpert () {
    return this.expert || false
  }

  toggleExpertMode () {
    this.setExpertmode(!this.expert)
  }
}
</script>
<style>

.IExpert_Icon {
  width: 12px !important;
  height: 12px !important;
  min-height: calc(var(--margin-top-maincontent) - 15px) !important;
}
</style>
