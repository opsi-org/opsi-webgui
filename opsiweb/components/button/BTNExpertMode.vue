<template>
  <b-button
    v-if="navbar"
    v-model="localMode"
    style="width:100%;"
    variant="primary"
    class="btn text-left btn_expertmode"
    :pressed.sync="localMode"
    @click="changeMode(localMode)"
  >
    {{ $t('settingsPage.mode') }}: {{ expert? 'Expert': 'Normal' }}
  </b-button>
  <b-button
    v-else
    v-model="localMode"
    style="width:180px;"
    variant="primary"
    :pressed.sync="localMode"
    @click="changeMode(localMode)"
  >
    {{ expert? 'Expert': 'Normal' }}
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
const settings = namespace('settings')

@Component export default class BTNExpertMode extends Vue {
  @Prop({ default: false }) navbar!: boolean
  // localmode: string = 'user'
  // @settings.Getter public modeIsExpert!: Boolean
  // @settings.Getter public expertmode!: Function // returns string
  // @settings.Mutation public setExpertmode!: (mode: string) => void

  localMode: boolean = false
  @settings.Getter public expert!: boolean
  @settings.Mutation public setExpertmode!: (isExpert: boolean) => void

  beforeMount () {
    this.localMode = this.expert
  }

  changeMode (localMode: boolean) {
    this.setExpertmode(localMode)
  }

  // toggleMode () {
  //   this.localmode = this.expertmode() as string
  //   if (this.localmode === 'user') {
  //     this.setExpertmode('expert')
  //   } else if (this.localmode === 'expert') {
  //     this.setExpertmode('user')
  //   } else {
  //     throw new Error(`no such mode: '${this.localmode}'`)
  //   }
  //   this.localmode = this.expertmode() as string
  // }
}
</script>

<style>

.btn_expertmode{
  /* max-height: inherit; */
  padding-left: 1em !important;
  padding-right: 1em !important;
}
/* .dd_expertmode {
  padding-left: 1em !important;
  padding-right: 1em !important;
} */
</style>
