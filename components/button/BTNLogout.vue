<template>
  <b-button
    ref="btn-logout"
    v-bind="$props"
    data-testid="ButtonBTNLogout"
    class="px-2 text-left"
    :class="{'pt-0 pb-0 pl-3 w-100': $mq=='mobile'}"
    :title="$t('button.logout.tooltip')"
    variant="primary"
    @click="doLogout"
  >
    <b-icon :icon="iconnames.logout" />
    {{ ($mq!=='desktop')? $t('button.logout'):'' }}
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants, CallLogout } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants, CallLogout] })
export default class BTNLogout extends Vue {
  callLogout: any
  iconnames: any
  $axios:any
  $mq: any
  @Prop({ default: false }) abortClick!: boolean

  async doLogout () {
    if (this.abortClick) { return }
    await this.callLogout()
  }
}
</script>
