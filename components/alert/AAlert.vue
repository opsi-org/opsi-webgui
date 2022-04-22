<template>
  <b-alert
    v-model="showAlert"
    data-testid="AAlert"
    class="alertbar"
    v-bind="$props"
    dismissible
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
import { Component } from 'nuxt-property-decorator'
import { BAlert } from 'bootstrap-vue'

@Component
export default class AAlert extends BAlert {
  showAlert: boolean = false
  alertMessage: string = ''
  alertVariant : string = ''
  showMore:boolean = false
  moreDetails: string = ''
  alert (message, variant = '', details = '') {
    this.alertMessage = message
    this.alertVariant = variant
    this.moreDetails = details
    this.showAlert = true
  }
}
</script>
<style>
.alertbar.alert-dismissible .close {
  color: black;
}
</style>
