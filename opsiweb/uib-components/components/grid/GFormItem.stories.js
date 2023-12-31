export default {
  title: 'Grid/G Form Item',
  parameters: { docs: { description: { component: 'Grid for a form item' } } }
}

const PrimaryTemplate = () => ({
  template: `
  <GridGFormItem label="Label:">
    <template #value>
      Value
    </template>
  </GridGFormItem>
  `
})

export const GFormItem = PrimaryTemplate.bind({})
