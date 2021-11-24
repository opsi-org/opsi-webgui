export default {
  title: 'Tree/T S Hostgroup Lazyload',
  parameters: { docs: { description: { component: 'Treeselect for host group selection with delayed loading children, where selection stored in vuexstore' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSHostGroupLazyLoad />'
})

// named export Primary to create respective story
export const TSHostGroupLazyLoad = PrimaryTemplate.bind({})
