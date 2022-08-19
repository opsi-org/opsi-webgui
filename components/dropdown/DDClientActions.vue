<template>
  <div data-testid="DDClientActions">
    <b-dropdown
      class="moreActions"
      variant="outline-primary border-0"
      :title="$t('button.tablerow.moreoptions')"
      no-caret
      :refetch="fetch"
    >
      <template #button-content>
        <IconILoading v-if="clientsLoading.includes(clientId)" :small="true" />
        <b-icon v-else :icon="iconnames.menu" />
      </template>
      <ModalMDeleteClient :client-id="clientId" />
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
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class DDClientActions extends Vue {
  iconnames: any
  @Prop({}) clientId!: string
  @Prop({ default: undefined }) fetch!: Function
  clientsLoading: Array<string> = []
}
</script>
