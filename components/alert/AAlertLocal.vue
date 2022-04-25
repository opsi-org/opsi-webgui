<template>
  <b-alert
    v-model="showAlert"
    data-testid="AAlertLocal"
    class="alertMsg"
    v-bind="$props"
    :variant="alertVariant"
    :aria-label="$props.variant"
  >
    <slot />
    {{ alertMessage }}
    <b-button v-if="moreDetails" class="btn-showDetails" variant="link" :pressed.sync="showMore">
      {{ $t('message.learnmore') }}
    </b-button>
    <p v-if="showMore">
      {{ moreDetails }}
    </p>
  </b-alert>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BAlert } from 'bootstrap-vue'

@Component
export default class AAlertLocal extends BAlert {
  showAlert: boolean = true
  alertMessage: string = ''
  showMore:boolean = false
  moreDetails: string = ''
  @Prop({ default: false }) show!: string
  @Prop({ default: 'warning' }) alertVariant!: string

  mounted () {
    // if (this.show && this.ref) {
    //   const ref = (this.$refs[this.ref + '-intern'] as any)
    // }
    this.alert(this.alertMessage, this.alertVariant, this.moreDetails)
  }

  alert (message, variant = '', details = '') {
    this.alertMessage = message
    this.alertVariant = variant
    this.moreDetails = details
    // this.showAlert = true
  }
}
</script>
<style>
.alertMsg.alert-dismissible .close {
  color: black;
}
</style>
