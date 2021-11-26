export default {
  title: 'Table/T Hostattributes',
  parameters: { docs: { description: { component: 'Table for HostAttributes' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTHostAttributes />'
})

// named export Primary to create respective story
export const THostAttributes = PrimaryTemplate.bind({})
