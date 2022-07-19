export default {
  title: 'View/V Settings',
  parameters: { docs: { description: { component: 'Settings view' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVSettings />'
})

// named export Primary to create respective story
export const VSettings = PrimaryTemplate.bind({})
