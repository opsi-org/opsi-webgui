export default {
  title: 'Table/T Simple Collapse',
  parameters: { docs: { description: { component: 'Table Simple Collapse' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTSimpleCollapse />'
})

// named export Primary to create respective story
export const TSimpleCollapse = PrimaryTemplate.bind({})
