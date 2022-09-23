<template>
  <div data-testid="DDClientActions"
      v-if="incontextmenu === false"
  >
    <b-dropdown
      class="moreActions"
      variant="outline-primary border-0"
      :title="$t('button.tablerow.moreoptions')"
      no-caret
    >
      <template #button-content>
        <IconILoading v-if="clientsLoading.includes(clientId)" :small="true" />
        <b-icon v-else :icon="iconnames.menu" />
      </template>
      <ModalMDeleteClient :client-id="clientId" :refetch="fetch" />
      <ButtonBTNEvent
        event="reboot"
        :data="clientId"
        :update-loading="loading => clientsLoading = loading"
      />
      <ButtonBTNEvent
        event="showpopup"
        :data="clientId"
        :update-loading="loading => clientsLoading = loading"
      />
    </b-dropdown>
  </div>
  <div v-else>
    <li class="dropdown-item">
      <ButtonBTNEvent
        event="showpopup"
        :data="clientId"
        :incontextmenu="incontextmenu"
        :update-loading="loading => clientsLoading = loading"
      />
    </li>
    <li class="dropdown-item">
      <ButtonBTNEvent
        event="reboot"
        :data="clientId"
        :incontextmenu="incontextmenu"
        :update-loading="loading => clientsLoading = loading"
      />
    </li>
    <li class="dropdown-item">
      <ModalMDeleteClient
        :client-id="clientId"
        :refetch="fetch"
        :incontextmenu="incontextmenu"
      />
    </li>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class DDClientActions extends Vue {
  iconnames: any
  @Prop({}) clientId!: string
  @Prop({ default: undefined }) fetch!: Function
  @Prop({ default: false }) incontextmenu!: boolean
  clientsLoading: Array<string> = []
}
</script>
