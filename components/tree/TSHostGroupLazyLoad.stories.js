export default {
  title: 'Tree/T S Hostgroup Lazyload',
  parameters: { docs: { description: { component: 'Treeselect for host groups with delayed loading children' } } }
}

const PrimaryTemplate = () => ({
  template: '<TreeTSHostGroupLazyLoad />'
})

// named export Primary to create respective story
export const TSHostGroupLazyLoad = PrimaryTemplate.bind({})
