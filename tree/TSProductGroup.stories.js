export default {
  title: 'Tree/T S Productgroup',
  parameters: { docs: { description: { component: 'Treeselect for product group selection' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSProductGroup />'
})

// named export Primary to create respective story
export const TSProductGroup = PrimaryTemplate.bind({})
