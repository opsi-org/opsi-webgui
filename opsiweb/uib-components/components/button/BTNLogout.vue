<template>
  <b-nav-item>
    <b-button
      ref="btn-logout"
      v-bind="$props"
      data-testid="ButtonBTNLogout"
      class="global_topbar_button px-2 text-left w-100 border-0"
      :class="{'pt-0 pb-0 pl-3 w-100': $mq=='mobile'}"
      :title="$t('button.logout.tooltip')"
      variant="primary"
      @click="doLogout"
    >
      <b-icon :icon="icon.logout" />
      {{ ($mq!=='desktop')? $t('button.logout'):'' }}
    </b-button>
  </b-nav-item>
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
