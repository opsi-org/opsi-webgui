export default {
  title: 'Modal/M Prod Save Overview',
  parameters: { docs: { description: { component: 'Modal for Product Save Overview' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ModalMProdSaveOverview :changelist="$props.changelist"/>'
})
const PrimaryTemplate2 = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ModalMProdSaveOverview :changelist="[]"/>'
})

// named export Primary to create respective story
export const MProdSaveOverviewEmpty = PrimaryTemplate2.bind({})
export const MProdSaveOverview = PrimaryTemplate.bind({})
MProdSaveOverview.args = {
  changelist: [
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
// TODO: test for click on button (opens tchanges)
