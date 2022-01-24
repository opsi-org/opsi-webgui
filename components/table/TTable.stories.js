export default {
  title: 'Table/T Table',
  parameters: { docs: { description: { component: 'Table' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTTable />'
})

// named export Primary to create respective story
export const TTable = PrimaryTemplate.bind({})
