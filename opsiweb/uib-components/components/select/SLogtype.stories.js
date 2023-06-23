export default {
  title: 'Select/S Logtype',
  parameters: { docs: { description: { component: 'Logtype selection' } } }
}

const PrimaryTemplate = () => ({
  template: '<SelectSLogtype />'
})

export const SLogtype = PrimaryTemplate.bind({})
