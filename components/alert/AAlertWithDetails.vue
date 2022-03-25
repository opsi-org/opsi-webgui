<template>
  <!-- :show="showAlert"
@dismissed="showAlert=false" -->
  <!-- :show="alertMessage!=''" -->
  <!-- @dismissed="alertMessage='';moreDetails? moreDetails='' : null" -->
  <AlertAAlert
    :show="showAlert"
    dismissible
    :variant="alertVariant"
    @dismissed="showAlert=false"
  >
    {{ alertMessage }}
    <b-button v-if="moreDetails" variant="link" :pressed.sync="showMore">
      Learn More
    </b-button>
    <p v-if="showMore">
      {{ moreDetails }}
    </p>
  </AlertAAlert>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class AAlertWithDetails extends Vue {
  // @Prop({ default: false }) showAlert!:boolean
  @Prop({ default: '' }) alertVariant!:string
  @Prop({ default: '' }) alertMessage!:string
  // @Prop({ default: false }) showMore!:boolean
  @Prop({ default: '' }) moreDetails?:string
  showMore:boolean = false

  get showAlert () {
    if (this.alertMessage !== '') {
      return true
    } else {
      return false
    }
  }
}
</script>
