export default {
  title: 'Table/T Collapseable',
  parameters: { docs: { description: { component: 'Table Collapseable' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTCollapseable />'
})

// named export Primary to create respective story
export const TCollapseable = PrimaryTemplate.bind({})
