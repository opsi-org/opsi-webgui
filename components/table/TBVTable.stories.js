export default {
  title: 'Table/TBV Table',
  parameters: { docs: { description: { component: 'Table' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: `<TableTBVTable
    type="small"
    :noheader="true"
    :hover="true"
    :filter="''"
    :filterfields="['depotId','clientId']"
    :items="args.items"
    :fields="['depotId', 'clientId', 'actionRequest', 'property', 'propertyValue']"
  >
    <template #cell()="row">
      <small>{{ row.value }}</small>
    </template>
  </TableTBVTable>`
})
// named export Primary to create respective story
export const TBVTable = PrimaryTemplate.bind({})
TBVTable.args = {
  items: [
    {
      user: 'user',
      depotId: 'depot',
      clientId: 'client',
      productId: 'product1',
      type: 'Product',
      actionRequest: 'setup'
    },
    {
      user: 'user',
      depotId: 'depot',
      clientId: 'client2',
      productId: 'product1',
      type: 'Product',
      actionRequest: 'setup'
    },
    {
      user: 'user',
      depotId: 'depot',
      clientId: 'client',
      productId: 'product2',
      actionRequest: 'setup',
      type: 'Product'
    },
    {
      user: 'user',
      depotId: 'depot',
      clientId: 'client',
      productId: 'product1',
      property: 'prop',
      propertyValue: ['test'],
      type: 'Product'
    },
    {
      user: 'user2',
      depotId: 'depot',
      clientId: 'client',
      productId: 'productX',
      property: 'prop',
      propertyValue: ['test'],
      type: 'Product'
    }
  ]
}
