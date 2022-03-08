export default {
  title: 'Tree/TS Host Groups',
  parameters: { docs: { description: { component: 'Treeselect for host groups with delayed loading children' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSHostGroups />'
})

// named export Primary to create respective story
export const TSHostGroups = PrimaryTemplate.bind({})
