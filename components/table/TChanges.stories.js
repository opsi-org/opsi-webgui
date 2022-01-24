export default {
  title: 'Table/T Changes',
  parameters: { docs: { description: { component: 'Table for Changes' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<TableTChanges :tableitems="$props.changeslist" />
  />
  `
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
      user: 'user2',
      depotId: 'depotId2',
      clientId: 'clientId2',
      productId: 'productId2',
      property: 'property2',
      propertyValue: ['propertyValue2'],
      type: 'type2',
      actionRequest: 'actionRequest2'
    },
    {
      user: 'user3',
      depotId: 'depotId3',
      clientId: 'clientId3',
      productId: 'productId3',
      property: 'property3',
      propertyValue: ['propertyValue3'],
      type: 'type3',
      actionRequest: 'actionRequest3'
    }
  ]
}
