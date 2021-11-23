export default {
  title: 'View/V Depots',
  parameters: { docs: { description: { component: 'Depots Table View' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ViewVDepots />'
})

// named export Primary to create respective story
export const VDepots = PrimaryTemplate.bind({})
