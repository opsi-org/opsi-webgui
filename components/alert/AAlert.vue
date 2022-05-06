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
    <p class="text-justify font-weight-bold">
      {{ alertMessage }}
    </p>
    <p v-if="moreDetails" class="text-justify mh-25">
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
  moreDetails: string = ''

  alert (message, variant = '', details = '') {
    this.alertMessage = message
    this.alertVariant = variant
    this.moreDetails = details
    this.showAlert = true
  }

  hide () {
    this.showAlert = false
  }
}
</script>
<style>
.alertbar.alert-dismissible .close {
  color: black;
}
</style>
