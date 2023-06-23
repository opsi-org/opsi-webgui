export default {
  title: 'Checkbox/C B Quick Save',
  parameters: { docs: { description: { component: 'Checkbox to enable/disable Quick Save' } } }
}

const PrimaryTemplate = () => ({
  template: '<CheckboxCBQuickSave />'
})

// named export Primary to create respective story
export const CBQuickSave = PrimaryTemplate.bind({})
