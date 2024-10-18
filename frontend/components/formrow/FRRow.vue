
<template>
  <!-- Use el-form outside this component -->
  <el-form-item v-bind="$attrs">
    <template #label>
      <el-text class="truncate">
        {{props.label}}
        <br >
      </el-text>
    </template>

    <template #default>
      <!-- {{ itemValue }} -->
      <slot name="value" >
        <el-checkbox v-if="props.type === 'checkbox'" :disabled="disabled" v-model="modelBool" :value="modelBool || ''"/>
        <el-input v-else-if="props.type === 'input'" :disabled="disabled" v-model="(modelValue as string)" @input="(x) => $emit('update:modelValue', x)"/>
        <el-button v-else-if="props.type === 'button'" :disabled="disabled" type="primary" @click="$emit('click')">{{props.text}}</el-button>
      </slot>
    </template>
  </el-form-item>
</template>

<script setup lang="ts">
// import { useIcons } from '~/composables/mixins/useIcons'
// const icons = useIcons()

// const model = defineModel({ required: true, type: String })
const $emit = defineEmits(['update:modelValue', 'click'])
const props = defineProps({
  label: { type: String, default: undefined },
  type: { type: String, default: 'input' },
  modelValue: { type: String, default: '' },
  text: { type: String, default: '' },
  dataType: { type: String, default: 'string' },
  disabled: { type: Boolean, default: false },
})
const modelBool = computed({
  get: () => props.modelValue === 'true',
  set: (v) => {
    // props.modelValue = v ? 'true' : 'false'
    $emit('update:modelValue', v)
  },
})

// const isMobile = ref(useMQ().isMobile)
// TODO check if works correctly
// watch(()=>useMQ().isMobile, ()=>{
//   isMobile.value = useMQ().isMobile.value
// }, {deep: true})
// const itemValue = ref(props.value)

// watch(()=>props.value, ()=>{
//   if (props.dataType === 'boolean') {
//     itemValue.value = props.value as boolean
//   } else {
//     itemValue.value = props.value as string
//   }
// })

// watch(()=>itemValue.value, ()=>{
//   if (props.dataType === 'boolean') {
//     $emit('change', itemValue.value)
//   } else {
//     $emit('change', itemValue.value)
//   }
// })

</script>

<style scoped>
.block {
  display: block !important;
}
/*
:deep(.el-input__prefix) {
  color: #000;
  right: 0;
  position: absolute;
  margin-right: 20px;
}
:deep(.el-form-item__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}*/
</style>