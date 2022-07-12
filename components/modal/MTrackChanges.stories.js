import { customstores } from '../../.utils/storybook/mock'
export default {
  title: 'Modal/M Track Changes',
  parameters: { docs: { description: { component: 'Modal for tracking changes. Currently shows only the product config changes, where user can reset or save the changes.' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ModalMTrackChanges />',
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
        changesProducts () { return [{ user: 'testuser', clientId: 'client1.domain.local', productId: 'opsi-client-agent', actionRequest: 'setup' }] }
      }
    }
  })
})

export const MTrackChanges = PrimaryTemplate.bind({})
