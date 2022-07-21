<template>
  <b-card
    data-testid="VLogin"
    class="text-center bg-primary mt-3 mx-auto"
    :style="$mq === 'mobile'? 'width:100%;' : 'width:50%;max-width:400px;' "
  >
    <IconIOpsiLogo :light="true" class="mb-3" height="35" />
    <h1 data-testid="login_title" class="d-inline-block text-light">
      {{ getTitleUppercase() }}
    </h1>
    <!-- <AlertAAlertLocal show> Wird in diesem Moment überarbeitet! Bitte habt Geduld :)</AlertAAlertLocal> -->
    <FormFLogin />
  </b-card>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({})
export default class VLogin extends Vue {
  $t:any

  getTitleUppercase () {
    return (this.$t('title.project') as string).toUpperCase()
  }
}
</script>
