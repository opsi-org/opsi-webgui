import { customstores } from '../../.utils/storybook/mock'

export default {
  title: 'Grid/G Changes Products',
  parameters: { docs: { description: { component: 'Grid for Product Changes' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<GridGChangesProducts />',
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
      clientId: 'clientId1',
      productId: 'productId1',
      property: 'property1',
      propertyValue: ['propertyValue1'],
      type: 'type1',
      actionRequest: 'actionRequest1'
    },
    {
      user: 'user',
      clientId: 'client',
      productId: 'product1',
      type: 'Product',
      property: '',
      propertyValue: '',
      actionRequest: 'setup'
    },
    {
      user: 'user',
      clientId: 'client2',
      productId: 'product1',
      type: 'Product',
      property: '',
      propertyValue: '',
      actionRequest: 'setup'
    },
    {
      user: 'user',
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
      productId: 'product1',
      property: 'prop',
      propertyValue: ['test'],
      actionRequest: '',
      type: 'Product'
    },
    {
      user: 'user2',
      depotId: 'depot',
      productId: 'productX',
      property: 'propUser2',
      propertyValue: ['testUser2'],
      actionRequest: '',
      type: 'Product'
    }
  ]
}
