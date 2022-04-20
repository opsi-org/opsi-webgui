export default {
  title: 'Nav/NI Collapsible',
  parameters: { docs: { description: { component: 'Navitem Collapsible' } } }
}

const PrimaryTemplate = () => ({
  template: '<NavItemNICollapsible title="menuitem.title" icon="menuitem.icon" submenu="menuitem.submenu" />'
})

// named export Primary to create respective story
export const NICollapsible = PrimaryTemplate.bind({})

// TODO story+tests for items
