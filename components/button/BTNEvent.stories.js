// import { argTypeVariants } from '../../.utils/types/ttestconsts'
export default {
  title: 'Button/BTN Event',
  parameters: { docs: { description: { component: 'Button Event' } } }
}

const PrimaryTemplateOnDemandDefault = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNEvent />'
})

const PrimaryTemplateReboot = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<ButtonBTNEvent
    event="reboot"
    :data="'clientId.domain'"
    />
  `
  // :update-loading="loading => clientsLoading = loading"
})

const PrimaryTemplateNotify = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<ButtonBTNEvent
    event="showpopup"
    :data="'clientId.domain'"
    />
  `
  // :update-loading="loading => clientsLoading = loading"
})

export const BTNEventOnDemandDefault = PrimaryTemplateOnDemandDefault.bind({})
export const BTNEventReboot = PrimaryTemplateReboot.bind({})
export const BTNEventNotify = PrimaryTemplateNotify.bind({})
