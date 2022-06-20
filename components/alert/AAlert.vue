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

    <b-list-group v-if="type=='object' && data" flush class="list-data-object">
      <b-list-group-item v-for="(v, k) in data" :key="k" :variant="(v.error)? 'danger': 'success'">
        <b>{{ k + $t('colon')}}</b> {{ v.error || v.result }}
      </b-list-group-item>
    </b-list-group>
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
  type:string = ''
  data:any = { }

  alert (message, variant = '', details = '') {
    this.alertMessage = message
    this.alertVariant = variant
    this.moreDetails = details
    this.showAlert = true
  }

  set (type = '', data = undefined) {
    this.type = type
    this.data = data
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
.alertbar .list-data-object{
  max-height: 200px;
  overflow: auto;
}
.alertbar .list-data-object .list-group-item {
  padding-top: 0px;
  padding-bottom: 0px;
  /* padding: 0px; */
}
</style>
