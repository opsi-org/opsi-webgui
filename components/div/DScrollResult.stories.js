export default {
  title: 'Div/D Scroll Result',
  parameters: { docs: { description: { component: 'Collapse/CContent description' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<DivDScrollResult style="max-height: 100px !important">
    Very long content... Very long content... Very long content... Very long content... Very long content... Very long content... Very long content... Very long content... Very long content... Very long content... Very long content... Very long content... Very long content...
    content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content
    </DivDScrollResult>
    `
})

export const DScrollResult = DefaultVisibleTemplate.bind({})
