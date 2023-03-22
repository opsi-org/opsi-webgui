<template>
  <div
    data-testid="DDClientActions"
    @mouseover="incontextmenu ? onOver($refs.actionsdropdown) : null"
    @mouseleave="incontextmenu ? onLeave($refs.actionsdropdown) : null"
    @focusin="incontextmenu ? onOver($refs.actionsdropdown) : null"
    @focusout="incontextmenu ? onLeave($refs.actionsdropdown) : null"
  >
    <b-dropdown
      ref="actionsdropdown"
      :variant="incontextmenu? 'transparent border-0' : 'outline-primary border-0'"
      size="sm"
      :no-caret="!incontextmenu"
      :class="{ 'dropdown-item contextmenu': incontextmenu }"
      :dropright="incontextmenu"
    >
      <template #button-content>
        <b-icon :icon="iconnames.menu" :title="$t('button.tablerow.moreoptions')" />
        <small v-if="incontextmenu">{{ $t('button.item-actions') }}</small>
      </template>
      <ButtonBTNEvent
        :class="{ 'dropdown-item contextmenu small': incontextmenu }"
        event="ondemand"
        :incontextmenu="incontextmenu"
        :data="clientId"
        :update-loading="loading => clientsLoading = loading"
        :with-text="true"
      />
      <ButtonBTNEvent
        :class="{ 'dropdown-item contextmenu small': incontextmenu }"
        event="showpopup"
        :incontextmenu="incontextmenu"
        :data="clientId"
        :update-loading="loading => clientsLoading = loading"
        :with-text="true"
      />
      <ButtonBTNEvent
        :class="{ 'dropdown-item contextmenu small': incontextmenu }"
        event="reboot"
        :incontextmenu="incontextmenu"
        :data="clientId"
        :update-loading="loading => clientsLoading = loading"
        :with-text="true"
      />
      <ModalMDeployClientAgent :class="{ 'dropdown-item contextmenu small': incontextmenu }" :incontextmenu="incontextmenu" :client-id="clientId" />
      <ModalMDeleteClient :class="{ 'dropdown-item contextmenu small': incontextmenu }" :incontextmenu="incontextmenu" :client-id="clientId" :refetch="fetch" />
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants, HoverDropdown } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants, HoverDropdown] })
export default class DDClientActions extends Vue {
  iconnames: any
  onOver: any
  onLeave: any
  @Prop({}) clientId!: string
  @Prop({ default: undefined }) fetch!: Function
  @Prop({ default: false }) incontextmenu!: boolean
  clientsLoading: Array<string> = []
}
</script>
<style>
</style>
