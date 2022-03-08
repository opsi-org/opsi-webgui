<template>
  <!-- variant="transparent"
    class="border-primary" -->
  <b-button
    v-bind="$attrs"
    data-testid="ButtonBTNInfo"
    size="sm"
    variant="outer-primary"
    @click="click"
  >
    <b-icon-info-circle />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class BTNInfo extends Vue {
  @Prop() click?: Function
}
</script>
