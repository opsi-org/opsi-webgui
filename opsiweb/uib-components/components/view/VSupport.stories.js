export default {
  title: 'View/V Support',
  parameters: { docs: { description: { component: 'Support view' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVSupport :with-iframe="false" />'
})

// named export Primary to create respective story
export const VSupport = PrimaryTemplate.bind({})
