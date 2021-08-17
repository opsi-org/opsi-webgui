<template>
  <b-button class="text-left dd_expertmode" @click="toggleMode">
    <b-icon v-if="localmode==='user'" icon="gem" class="" font-scale="0.8"/>
    <b-icon v-else-if="localmode==='expert'" icon="gem" class="" font-scale="0.8" variant="danger" />
    {{($mq=='mobile') ? $t('expertmode') : '' }} {{ (localmode === 'expert') ? 'on':'' }}
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
const settings = namespace('settings')

@Component export default class DDExpertMode extends Vue {
  @Prop({ default: false }) dropup!: boolean
  localmode: string = 'user'
  @settings.Getter public expertmode!: Function // returns string
  @settings.Mutation public setExpertmode!: (mode: string) => void

  toggleMode () {
    this.localmode = this.expertmode() as string
    if (this.localmode === 'user') {
      this.setExpertmode('expert')
    } else if (this.localmode === 'expert') {
      this.setExpertmode('user')
    } else {
      throw new Error(`no such mode: '${this.localmode}'`)
    }
    this.localmode = this.expertmode() as string
  }
}
</script>

<style>
.dd_expertmode {
  padding-left: 1em !important;
  padding-right: 1em !important;
}
</style>
