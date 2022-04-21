// Describe card component
export default {
  title: 'Bar/B Page Header',
  parameters: { docs: { description: { component: 'Bar/BPageHeader description' } } }
}

// Define template for Story
const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: `<BarBPageHeader v-bind="args" >
    <template #left> {{ args.slotleft }} </template>
    <template #right> {{ args.slotright }} </template>
  </BarBPageHeader>
  `
})

// named export to create respective story
export const BPageHeader = PrimaryTemplate.bind({})
BPageHeader.args = {
  variant: 'transparent',
  title: 'Title',
  collapsed: false,
  bold: false,
  slotleft: 'Left',
  slotright: 'Right',
  navbartype: 'collapse'
}
