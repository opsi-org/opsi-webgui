export default {
  title: 'View/V Support',
  parameters: { docs: { description: { component: 'Support Page' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVSupport :with-iframe="false" />'
})

export const VSupport = PrimaryTemplate.bind({})
