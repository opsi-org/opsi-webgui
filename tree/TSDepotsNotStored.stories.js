export default {
  title: 'Tree/T S Depots Not Stored',
  parameters: { docs: { description: { component: 'Treeselect for depot selection, where selection not stored' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSDepotsNotStored />'
})

// named export Primary to create respective story
export const TSDepotsNotStored = PrimaryTemplate.bind({})
