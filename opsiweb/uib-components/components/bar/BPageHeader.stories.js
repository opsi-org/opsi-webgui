export default {
  title: 'Bar/B Page Header',
  parameters: { docs: { description: { component: 'Pageheader' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: `<BarBPageHeader v-bind="args" >
    <template #left> {{ args.slotleft }} </template>
    <template #right> {{ args.slotright }} </template>
  </BarBPageHeader>
  `
})

export const BPageHeader = PrimaryTemplate.bind({})
BPageHeader.args = {
  variant: 'transparent',
  title: 'Title',
  collapsed: false,
  slotleft: 'Left',
  slotright: 'Right',
  navbartype: 'collapse'
}
