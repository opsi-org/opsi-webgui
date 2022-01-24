export default {
  title: 'Collapse/C Content',
  parameters: { docs: { description: { component: 'Collapse/CContent description' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<CollapseCContent
  id="testid"
  title="title"
  :bold="true"
  :visible="false"
  >
  <template #content>
    <small>content</small>
  </template>
  </CollapseCContent>
  `
})

export const CContent = DefaultVisibleTemplate.bind({})
// CContent.args = {
//   totalRows: 20,
//   pageNumber: 1,
//   perPage: 10
// }
