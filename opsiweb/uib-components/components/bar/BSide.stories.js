import { store } from '../../.utils/storybook/mock'

export default {
  title: 'bar/B Side',
  parameters: { docs: { description: { component: 'Bar/BSide description' } } }
}

const DefaultVisibleTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<BarBSide class="sidebar_content" :always-visible="true" :attributes="args.attributes" /> '
  // data () { return { attributes: { visible: args.attributes.visible, collapsed: args.attributes.collapsed } } },
  // template: '<BarBSide class="sidebar_content" :always-visible="true" :attributes="attributes" /> '
})

const DefaultVisibleAuthTemplate = (args, { argTypes }) => ({
  store: store(), // to keep the default (duration: 2min) (note: authentication is enabled by default currently)
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<BarBSide class="sidebar_content" :always-visible="true" :attributes="args.attributes" /> '
})

export const BSide = DefaultVisibleTemplate.bind({})
BSide.args = { attributes: { expanded: false, visible: true } }

export const BSideAuthenticated = DefaultVisibleAuthTemplate.bind({})
BSideAuthenticated.args = { attributes: { expanded: false, visible: true, authenticated: true } } // small

// todo clicking on expand-btn not possible (only in storebook - why??)
// export const BSideSmall = DefaultVisibleTemplate.bind({})
// BSideSmall.args = { attributes: { expanded: false, visible: true } }

// export const BSideSmallAuthenticated = DefaultVisibleAuthTemplate.bind({})
// BSideSmallAuthenticated.args = { attributes: { expanded: false, visible: true, authenticated: true } } // small

// export const BSideSmall = DefaultVisibleTemplate.bind({})
// export const BSideSmallAuthenticated = DefaultVisibleTemplate.bind({})
// BSideSmall.args = { ...attrs }
// BSideSmallAuthenticated.args = { ...attrs, authenticated: true }
