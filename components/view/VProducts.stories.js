export default {
  title: 'View/V Products',
  parameters: { docs: { description: { component: 'Products view with depots, hostgroups and product groups selection' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVProducts/>'
})

// named export Primary to create respective story
export const VProducts = PrimaryTemplate.bind({})
