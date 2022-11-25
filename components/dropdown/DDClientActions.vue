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
      variant="outline-primary border-0"
      size="sm"
      :no-caret="!incontextmenu"
      :title="incontextmenu ? '' : $t('button.sort.tablecolumns')"
      :class="{ 'dropdown-item contextmenu': incontextmenu }"
      :dropright="incontextmenu"
    >
      <template #button-content>
        <b-icon :icon="iconnames.menu" :title="$t('button.tablerow.moreoptions')" />
        <small v-if="incontextmenu">{{ $t('button.item-actions') }}</small>
      </template>
      <ButtonBTNEvent event="ondemand" class="dropdown-item" :data="clientId" :update-loading="loading => clientsLoading = loading" :with-text="true" />
      <ButtonBTNEvent event="showpopup" class="dropdown-item" :data="clientId" :update-loading="loading => clientsLoading = loading" :with-text="true" />
      <ButtonBTNEvent event="reboot" class="dropdown-item" :data="clientId" :update-loading="loading => clientsLoading = loading" :with-text="true" />
      <ModalMDeployClientAgent class="dropdown-item" :client-id="clientId" />
      <ModalMDeleteClient class="dropdown-item" :client-id="clientId" :refetch="fetch" />
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
