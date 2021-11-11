export default {
  title: 'Button/BTN ClearSelectedClients',
  parameters: { docs: { description: { component: 'Button to clear client selection' } } }

}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNClearSelectedClients />'
})

export const BTNClearSelectedClients = PrimaryTemplate.bind({})
