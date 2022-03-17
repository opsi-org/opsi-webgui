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
    <b-icon :icon="iconnames.info"/>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTNInfo extends Vue {
  iconnames: any
  @Prop() click?: Function
}
</script>
