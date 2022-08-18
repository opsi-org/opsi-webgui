import { customstores } from '../../.utils/storybook/mock'
export default {
  title: 'Modal/M Track Changes',
  parameters: { docs: { description: { component: 'Modal for tracking changes. Currently shows only the product config changes, where user can reset or save the changes.' } } }
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
        }
      }
    }
  })
})

export const MTrackChanges = PrimaryTemplate.bind({})
