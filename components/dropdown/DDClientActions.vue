<template>
  <div
    v-if="incontextmenu === false"
    data-testid="DDClientActions"
    :class="{incontextmenu: (incontextmenu != false)}"
    @mouseover="onOver($refs.dropdown)"
    @mouseleave="onLeave($refs.dropdown)"
  >
    <b-dropdown
      ref="dropdown"
      variant="outline-primary border-0"
      class="DDClientActionsBtn moreActions"
      no-caret
      :class="{incontextmenu: (incontextmenu != false)}"
    >
      <template #button-content>
        <IconILoading v-if="clientsLoading.includes(clientId)" :small="true" />
        <b-icon v-else :icon="iconnames.menu" :title="$t('button.tablerow.moreoptions')" />
      </template>
      <ModalMDeployClientAgent :client-id="clientId" />
      <ModalMDeleteClient :client-id="clientId" :refetch="fetch" />
      <ButtonBTNEvent
        event="ondemand"
        :data="clientId"
        :update-loading="loading => clientsLoading = loading"
        :with-text="true"
      />
      <ButtonBTNEvent
        event="reboot"
        :data="clientId"
        :update-loading="loading => clientsLoading = loading"
        :with-text="true"
      />
      <ButtonBTNEvent
        event="showpopup"
        :data="clientId"
        :update-loading="loading => clientsLoading = loading"
        :with-text="true"
      />
    </b-dropdown>
  </div>
  <div
    v-else
    @mouseover="onOver($refs.dropdown)"
    @mouseleave="onLeave($refs.dropdown)"
  >

    <b-dropdown
      v-bind="$props"
      ref="dropdown"
      data-testid="DDClientActions"
      dropright
      lazy
      :no-caret="incontextmenu == false"
      :toggle-tag="incontextmenu !== false ? 'li': 'button'"
      :variant="incontextmenu !== false ? 'outline-primary': 'outline-primary'"
      size="sm"
      alt="Show column"
      class="DDClientActionsBtn fixed_column_selection noborder w-100 text-left"
      :class="{ 'absolutright': (incontextmenu !== false) }"
      :toggle-class="{
        'w-100 h-100 text-left': true,
        'dropdown-item incontextmenu ': (incontextmenu !== false) }"
    >
      <template #button-content>
        <b-icon :icon="iconnames.menu" />
        <small v-if="incontextmenu !== false" :title="$t('button.item-actions.title')" style="font-size: 85%;">{{ $t('button.item-actions') }}</small>
      </template>
      <small class="dropdown-item">
        <ModalMDeployClientAgent
          style="padding-left: 0px;"
          :client-id="clientId"
          :incontextmenu="incontextmenu"
        />
      </small>
      <small class="dropdown-item">
        <ButtonBTNEvent
          event="ondemand"
          :data="clientId"
          :incontextmenu="incontextmenu"
          :update-loading="loading => clientsLoading = loading"
          :with-text="true"
        />
      </small>
      <small class="dropdown-item">
        <ButtonBTNEvent
          event="showpopup"
          :data="clientId"
          :incontextmenu="incontextmenu"
          :update-loading="loading => clientsLoading = loading"
          :with-text="true"
        />
      </small>
      <small class="dropdown-item">
        <ButtonBTNEvent
          event="reboot"
          :data="clientId"
          :incontextmenu="incontextmenu"
          :update-loading="loading => clientsLoading = loading"
          :with-text="true"
        />
      </small>
      <small class="dropdown-item">
        <ModalMDeleteClient
          style="padding-left: 0px;"
          :client-id="clientId"
          :refetch="fetch"
          :incontextmenu="incontextmenu"
        />
      </small>
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
.DDClientActionsBtn .incontextmenu::after {
  float: right !important;
  margin-top: 10px;
}
</style>
