<template>
  <!-- variant="transparent"
    class="border-primary" -->
  <b-button
    v-bind="$attrs"
    data-testid="ButtonBTNInfo"
    size="sm"
    class="border-0"
    variant="outline-primary"
    @click="click"
  >
    <b-icon :icon="iconnames.info" />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import * as mixin from '../../mixins/uib-mixins'

@Component({ mixins: [mixin.Constants] })
export default class BTNInfo extends Vue {
  iconnames: any
  @Prop() click?: Function
}
</script>
