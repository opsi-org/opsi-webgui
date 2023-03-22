export default {
  title: 'Select/S Logtype',
  parameters: { docs: { description: { component: 'Select for Logtype' } } }
}

const PrimaryTemplate = () => ({
  template: '<SelectSLogtype />'
})

// named export Primary to create respective story
export const SLogtype = PrimaryTemplate.bind({})
