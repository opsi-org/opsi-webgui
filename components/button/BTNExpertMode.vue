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
      <span class="sr-only">{{ expert? 'Expert': 'Normal' }}</span>
      <b-icon-star-fill v-if="expert" variant="light" />
      <b-icon-star v-else variant="light" />
    </template>
    <span v-else>
      {{ expert? 'Expert': 'Normal' }}
    </span>
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
const settings = namespace('settings')

@Component export default class BTNExpertMode extends Vue {
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
