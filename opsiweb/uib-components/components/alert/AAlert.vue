<template>
  <!-- <custom-block-licence>
  -*- coding: utf-8 -*-

  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de>
  All rights reserved.
  License: AGPL-3.0
</custom-block-licence> -->
  <b-alert
    v-model="showAlert"
    data-testid="AAlert"
    class="alertbar"
    size="sm"
    v-bind="$props"
    dismissible
    :variant="alertVariant"
    :aria-label="$props.variant"
  >
    <slot />
    <div class="text-small">
      {{ alertMessage }}<slot name="button" />
      <template v-if="moreDetails">
        <b-button
          v-if="moreDetails.length>1"
          :title="showMore? $t('button.collapse'): $t('button.expand')"
          :variant="alertVariant"
          class="float-right border-0 p-0 pb-2 btn-alertdetails"
          :pressed.sync="showMore"
        >
          <b-icon :icon="showMore ? icon.arrowUp : icon.arrowDown" />
        </b-button>
        <template v-if="showMore">
          <div v-if="typeof moreDetails == 'object'" class="scrollValue">
            <pre>{{ JSON.stringify(moreDetails, null, 2) }}</pre>
          </div>
          <div v-else class="overflow-auto mh-25">
            {{ moreDetails }}
          </div>
        </template>
      </template>
    </div>
  </b-alert>
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator'
import { BAlert } from 'bootstrap-vue'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class AAlert extends BAlert {
  icon: any
  showAlert: boolean = false
  alertMessage: string = ''
  alertVariant : string = ''
  moreDetails: string = ''
  showMore:boolean = true
  data:any = { }

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
.alertbar .list-data-object{
  max-height: 200px;
  overflow: auto;
}
.alertbar .list-data-object .list-group-item {
  padding-top: 0px;
  padding-bottom: 0px;
}
.alertdetails {
  color: var(--color);
  background-color: var(--background);
}
</style>
