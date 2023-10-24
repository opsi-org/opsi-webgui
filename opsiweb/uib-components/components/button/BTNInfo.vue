<template>
  <b-button
    v-bind="$attrs"
    data-testid="ButtonBTNInfo"
    size="sm"
    class="border-0"
    variant="outline-primary"
    @click="click"
  >
    <IconIIcon :icon="icon.info" />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTNInfo extends Vue {
  icon: any
  @Prop() click?: Function
}
</script>
