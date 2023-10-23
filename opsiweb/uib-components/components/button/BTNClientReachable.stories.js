
export default {
  title: 'Button/BTN Client Reachable',
  parameters: { docs: { description: { component: 'Button to check client reachability status' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ButtonBTNClientReachable />'
})

// named export Primary to create respective story
export const BTNClientReachable = PrimaryTemplate.bind({})
