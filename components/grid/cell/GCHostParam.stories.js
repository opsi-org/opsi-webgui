export default {
  title: 'Gridcell/G C Host Parameter value',
  parameters: { docs: { description: { component: 'Grid cell for Host param value' } } }
}

const BoolConfig = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<GridCellGCHostParamValue v-bind="args" />'
})

export const GCHostParamValueBool = BoolConfig.bind({})
GCHostParamValueBool.args = {
  configtype: 'BoolConfig',
  type: 'depots',
  row: {
    configId: 'license-management.use',
    description: 'Activate license management',
    type: 'BoolConfig',
    value: true,
    possibleValues: [false, true, true, false],
    multiValue: false,
    editable: false
  }
}

const UnicodeConfig = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<GridCellGCHostParamValue v-bind="args" />'
})

export const GCHostParamValueUnicode = UnicodeConfig.bind({})
GCHostParamValueUnicode.args = {
  configtype: 'UnicodeConfig',
  type: 'depots',
  row: {
    configId: 'product_sort_algorithm',
    description: '',
    type: 'UnicodeConfig',
    value: 'algorithm2',
    possibleValues: ['algorithm1', 'algorithm2'],
    multiValue: false,
    editable: false
  }
}
