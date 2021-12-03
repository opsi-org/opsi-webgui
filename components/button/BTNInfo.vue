<template>
  <b-button
    v-bind="$attrs"
    data-testid="ButtonBTNInfo"
    size="sm"
    variant="transparent"
    class="border-primary"
    @click="click"
  >
    <b-icon-info />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class BTNHelp extends Vue {
  @Prop() click?: Function
}
</script>
