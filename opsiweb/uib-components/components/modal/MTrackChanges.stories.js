import { customstores } from '../../.utils/storybook/mock'
export default {
  title: 'Modal/M Track Changes',
  parameters: { docs: { description: { component: 'Modal for showing tracked changes.' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<b-badge variant="primary"><ModalMTrackChanges /></b-badge>',
  store: customstores({
    auth: {
      namespaced: true,
      getters:
        { username () { return 'testuser' } }
    },
    settings: {
      namespaced: true,
      getters:
        { quicksave () { return false } }
    },
    changes: {
      namespaced: true,
      getters: {
        changesProducts () {
          return [
            { user: 'testuser', clientId: 'client1.domain.local', productId: 'productId', actionRequest: 'setup' },
            { user: 'testuser', clientId: 'client2.domain.local', productId: 'productId', actionRequest: 'setup' },
            { user: 'testuser', clientId: 'client3.domain.local', productId: 'productId', actionRequest: 'setup' }
          ]
        },
        changesHostParam () {
          return [
            { user: 'testuser', hostId: 'client1.domain.local', type: 'clients', configId: 'configId1', value: 'true' },
            { user: 'testuser', hostId: 'client2.domain.local', type: 'clients', configId: 'configId2', value: 'value1' },
            { user: 'testuser', hostId: 'depot1.domain.local', type: 'depots', configId: 'configId3', value: ['value1', 'value2'] }
          ]
        }
      }
    }
  })
})

export const MTrackChanges = PrimaryTemplate.bind({})
