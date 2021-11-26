export default {
  title: 'Table/T Changes',
  parameters: { docs: { description: { component: 'Table for Changes' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTChanges />'
})

// named export Primary to create respective story
export const TChanges = PrimaryTemplate.bind({})
