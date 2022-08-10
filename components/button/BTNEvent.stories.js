// import { argTypeVariants } from '../../.utils/types/ttestconsts'
import { customstores } from '../../.utils/storybook/mock'
export default {
  title: 'Button/BTN Event',
  parameters: { docs: { description: { component: 'Button Event' } } }
}

const PrimaryTemplateOnDemandDefault = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<b-badge variant="transparent"><ButtonBTNEvent v-bind="args" /></b-badge>',
  store: customstores({
    selections: {
      namespaced: true,
      getters: {
        selectionClients () { return ['client1.domain.local', 'client2.domain.local', 'client3.domain.local'] },
      }
    }
  })
})

const PrimaryTemplateReboot = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<b-badge variant="transparent"><ButtonBTNEvent
    event="reboot"
    :data="'clientId.domain'"
    /></b-badge>
  `
  // :update-loading="loading => clientsLoading = loading"
})

const PrimaryTemplateNotify = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<b-badge variant="transparent"><ButtonBTNEvent
    event="showpopup"
    :data="'clientId.domain'"
    /></b-badge>
  `
  // :update-loading="loading => clientsLoading = loading"
})

export const BTNEventOnDemandDefault = PrimaryTemplateOnDemandDefault.bind({})
BTNEventOnDemandDefault.args = {
  isLoading: false
}
export const BTNEventReboot = PrimaryTemplateReboot.bind({})
export const BTNEventNotify = PrimaryTemplateNotify.bind({})
