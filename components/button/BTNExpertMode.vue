<template>
  <b-button
    v-model="localMode"
    data-testid="ButtonBTNExpertMode"
    variant="primary"
    :class="navbar? 'navmodebutton': 'modebutton'"
    :pressed.sync="localMode"
    @click="changeMode(localMode)"
  >
    <template v-if="navbar">
      <span class="sr-only">{{ expert? 'Expert': 'Basic' }}</span>
      <b-icon v-if="expert" :icon="iconnames.usermodeExpert" variant="light" />
      <b-icon v-else :icon="iconnames.usermodeBasic" variant="light" />
    </template>
    <span v-else>
      {{ expert? 'Expert': 'Basic' }}
    </span>
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const settings = namespace('settings')

@Component({ mixins: [Constants] })
export default class BTNExpertMode extends Vue {
  iconnames: any
  @Prop({ default: false }) navbar!: boolean

  localMode: boolean = false
  @settings.Getter public expert!: boolean
  @settings.Mutation public setExpertmode!: (isExpert: boolean) => void

  beforeMount () {
    this.localMode = this.expert
  }

  changeMode (localMode: boolean) {
    this.setExpertmode(localMode)
  }
}
</script>

<style>
.btn_expertmode{
  padding-left: 1em !important;
  padding-right: 1em !important;
}

.navmodebutton{
  height:45px;
  width:45px;
}
.modebutton{
  height:45px;
  margin:0px;
  width:184px;
}

</style>
