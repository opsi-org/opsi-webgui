export default {
  title: 'Tree/TS Clients',
  parameters: { docs: { description: { component: 'Treeselect for client selection, where selection not stored.' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSClientsNotStored placeholder="-- Please select a Client --" />'
})

// named export Primary to create respective story
export const TSClientsNotStored = PrimaryTemplate.bind({})
