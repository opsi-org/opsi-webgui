<template>
  <div
    data-testid="DDClientActions"
    class="DDClientActions"
    :class="{
      'contextmenu ': incontextmenu!==false,
      'btn btn-outline-primary btn-sm color-primary-selected': incontextmenu===false,
    }"
    @mouseover="incontextmenu ? onOver($refs.actionsdropdown) : null"
    @mouseleave="incontextmenu ? onLeave($refs.actionsdropdown) : null"
    @focusin="incontextmenu ? onOver($refs.actionsdropdown) : null"
    @focusout="incontextmenu ? onLeave($refs.actionsdropdown) : null"
  >
    <b-dropdown
      ref="actionsdropdown"
      :variant="incontextmenu? 'transparent border-0' : 'outline-primary'"
      size="sm"
      :no-caret="!incontextmenu"
      :class="{ 'dropdown-item contextmenu ': incontextmenu!==false }"
      :dropright="incontextmenu"
    >
      <template #button-content>
        <b-icon :icon="icon.menu" :title="$t('button.tablerow.moreoptions')" class="color-primary-selected mb-1" />
        <span v-if="incontextmenu" class="color-primary-selected">{{ $t('button.item-actions') }}</span>
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
      <ModalMRenameClient :class="{ 'dropdown-item contextmenu small': incontextmenu }" :incontextmenu="incontextmenu" :client-id="clientId" :refetch="fetch" />
      <ModalMDeleteClient :class="{ 'dropdown-item contextmenu small': incontextmenu }" :incontextmenu="incontextmenu" :client-id="clientId" :refetch="fetch" />
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { HoverDropdown } from '../../mixins/component'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons, HoverDropdown] })
export default class DDClientActions extends Vue {
  icon: any
  onOver: any
  onLeave: any
  @Prop({}) clientId!: string
  @Prop({ default: undefined }) fetch!: Function
  @Prop({ default: false }) incontextmenu!: boolean
  clientsLoading: Array<string> = []
}
</script>
<style>
.DDClientActions .dropdown-menu .btn,
.table tr:hover .DDClientActions .dropdown-menu .btn  {
  color: var(--primary-foreground) !important;
}
.row-selected .color-primary-selected,
.row-selected .color-primary-selected:hover {
  color: var(--primary-foreground) !important;
}
.DDClientActions.btn {
  padding: 0px;
}
.DDClientActions > div:not(.contextmenu) > .btn-outline-primary:hover,
.DDClientActions > div:not(.contextmenu) > .btn:hover,
.DDClientActions > div:not(.contextmenu) > .btn {
  border: 0px!important;
  background-color: unset !important;
  margin: 0px;
  height: calc(var(--component-height) - 5px) !important;
  min-height: calc(var(--min-height-button) - 5px) !important;
  width: 100%;
}
</style>
