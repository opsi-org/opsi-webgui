import { customstores } from '../../.utils/storybook/mock'

export default {
  title: 'Table/T Changes',
  parameters: { docs: { description: { component: 'Table for Changes' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TableTChanges />',
  store: customstores({
    auth: {
      namespaced: true,
      getters:
        { username () { return 'user' } }
    },
    changes: {
      namespaced: true,
      getters: {
        changesProducts () { return args.changeslist }
      }
    }
  })
})

export const TChanges = PrimaryTemplate.bind({})
TChanges.args = {
  changeslist: [
    {
      user: 'user1',
      depotId: 'depotId1',
      clientId: 'clientId1',
      productId: 'productId1',
      property: 'property1',
      propertyValue: ['propertyValue1'],
      type: 'type1',
      actionRequest: 'actionRequest1'
    },
    {
      user: 'user',
      depotId: 'depot',
      clientId: 'client',
      productId: 'product1',
      type: 'Product',
      property: '',
      propertyValue: '',
      actionRequest: 'setup'
    },
    {
      user: 'user',
      depotId: 'depot',
      clientId: 'client2',
      productId: 'product1',
      type: 'Product',
      property: '',
      propertyValue: '',
      actionRequest: 'setup'
    },
    {
      user: 'user',
      depotId: 'depot',
      clientId: 'client',
      productId: 'product2',
      actionRequest: 'setup',
      property: '',
      propertyValue: '',
      type: 'Product'
    },
    {
      user: 'user',
      depotId: 'depot',
      clientId: 'client',
      productId: 'product1',
      property: 'prop',
      propertyValue: ['test'],
      actionRequest: '',
      type: 'Product'
    },
    {
      user: 'user2',
      depotId: 'depot',
      clientId: 'client',
      productId: 'productX',
      property: 'prop',
      propertyValue: ['test'],
      actionRequest: '',
      type: 'Product'
    }
  ]
}
