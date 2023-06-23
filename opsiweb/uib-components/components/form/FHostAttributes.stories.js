
import { mock, customstores } from '../../.utils/storybook/mock'
const cid = 'dummy.client.id'
const hostconfig = [{
  created: '2020-12-11T13:26:47',
  description: `client description "${cid}"`,
  hardwareAddress: 'af:fe:af:fe:af:fe',
  hostId: cid,
  inventoryNumber: '',
  ipAddress: '1.1.1.1',
  lastSeen: '2020-12-11T13:26:47',
  notes: `client notes "${cid}"`,
  oneTimePassword: null,
  opsiHostKey: '123456789abcdefghijklmnopqrstu',
  type: 'OpsiClient'
}]

mock.onGet(`/api/opsidata/hosts?hosts=${cid}`).reply(200, hostconfig)

export default {
  title: 'Form/F Host Attributes',
  parameters: { docs: { description: { component: 'Form for Host Attributes' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<FormFHostAttributes id="${cid}"/>`,
  store: customstores({
    'config-app': {
      namespaced: true,
      getters: {
        config () { return false }
      }
    }
  })
})

export const FHostAttributes = PrimaryTemplate.bind({})
FHostAttributes.args = { id: cid }
