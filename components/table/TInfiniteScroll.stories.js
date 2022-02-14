export default {
  title: 'Table/T Infinite Scroll',
  parameters: { docs: { description: { component: 'Infinite Scroll Table' } } }
}

const PrimaryTemplate = () => ({
  template: '<TableTInfiniteScroll id="Depots" ref="Depots" primary-key="Depots" :items="$props.items" />'
})

// named export Primary to create respective story
export const TInfiniteScroll = PrimaryTemplate.bind({})
TInfiniteScroll.args = {
  items: [
    {
      depotId: 'aaaa.xyz.local',
      ident: 'aaaa.xyz.local',
      type: '',
      ip: '',
      description: ''
    }
  ]
}
