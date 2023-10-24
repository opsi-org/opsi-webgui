<template>
  <b-button
    ref="btn-logout"
    v-bind="$props"
    data-testid="ButtonBTNLogout"
    :title="$t('button.logout')"
    size="sm"
    block
    variant="outline-primary"
    @click="doLogout"
  >
    <IconIIcon :icon="icon.logout" />
    {{ $t('button.logout') }}
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { CallLogout } from '../../mixins/post'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons, CallLogout] })
export default class BTNLogout extends Vue {
  @Prop({ default: false }) abortClick!: boolean
  callLogout: any
  icon: any
  $axios:any
  $mq: any

  async doLogout () {
    if (this.abortClick) { return }
    await this.callLogout()
  }
}
</script>
