<template>
  <b-alert v-if="showAlert" :variant="alertVariant" dismissible @dismissed="showAlert = false">
    {{ alertMessage }}
  </b-alert>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class AAlertExtended extends Vue {
  showAlert: boolean = false
  alertMessage: string = ''
  alertVariant : string = ''
  showMore:boolean = false
  alert (message, variant = '') {
    console.error('showAlert before', message + this.showAlert)
    this.alertMessage = message
    this.alertVariant = variant
    this.showAlert = true
    console.error('showAlert after', message + this.showAlert)
  }
}
</script>
<style>
.alertMsg.alert-dismissible .close {
  color: black;
}
</style>
