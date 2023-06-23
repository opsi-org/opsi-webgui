<template>
  <b-alert
    data-testid="AlertAutoDismissible"
    :show="dismissCountDown"
    dismissible
    size="sm"
    v-bind="$props"
    :variant="alertVariant"
    :aria-label="$props.variant"
    @dismissed="dismissCountDown=0"
    @dismiss-count-down="countDownChanged"
  >
    <slot />
    <div class="mh-25 text-small">
      {{ alertMessage }}
      <span v-if="moreDetails">
        {{ moreDetails }}
      </span>
    </div>
  </b-alert>
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator'
import { BAlert } from 'bootstrap-vue'

@Component
export default class AAlertAutoDismissible extends BAlert {
  alertMessage: string = ''
  moreDetails: string = ''
  dismissSecs: number = 5
  dismissCountDown: number = 0
  alertVariant : string = 'success'

  mounted () {
    this.alert(this.alertMessage, this.alertVariant, this.moreDetails)
  }

  alert (message, variant = '', details = '') {
    this.alertMessage = message
    this.alertVariant = variant
    this.moreDetails = details
    if (this.alertMessage !== '') {
      this.showAlert()
    }
  }

  countDownChanged (dismissCountDown) {
    this.dismissCountDown = dismissCountDown
  }

  showAlert () {
    this.dismissCountDown = this.dismissSecs
  }
}
</script>
