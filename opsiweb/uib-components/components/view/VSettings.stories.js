export default {
  title: 'View/V Settings',
  parameters: { docs: { description: { component: 'Settings' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVSettings />'
})

export const VSettings = PrimaryTemplate.bind({})
