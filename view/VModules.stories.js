export default {
  title: 'View/V Modules',
  parameters: { docs: { description: { component: 'Modules Table' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVModules />'
})

// named export Primary to create respective story
export const VModules = PrimaryTemplate.bind({})
