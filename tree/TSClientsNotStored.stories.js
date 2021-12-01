export default {
  title: 'Tree/T S Clients',
  parameters: { docs: { description: { component: 'Treeselect for client selection, where selection not stored.' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSClientsNotStored />'
})

// named export Primary to create respective story
export const TSClientsNotStored = PrimaryTemplate.bind({})
