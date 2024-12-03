<template>
  <div>

    <el-tooltip
      :content="$t('form.multiselection.cbvalue.tooltip')"
      placement="top"
    >
      <el-switch
        v-if="props.type==='checkbox'"
        v-model="cbValue"
        inline-prompt
        :active-text="$t('form.multiselection.cbvalue.on')"
        :inactive-text="$t('form.multiselection.cbvalue.off')"
        size="large"
        v-bind="$props"
        @change="changeSelectionMode"
      />
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
const $t = useI18n().t
const selections = storeSelections()

const emit = defineEmits(['action'])
const props = defineProps({
  type: { type: String, default: 'checkbox' }
})

const cbValue = computed({
  get: () => selections.multiSelection,
  set: () => {}
})

watch(()=>selections.multiSelection, (val)=>{
  if (val !== true) {
    if (selections.selectionDepots.length > 1) {
      selections.setSelectionDepots([selections.selectionDepots[0]])
    }
    if (selections.selectionClients.length > 1) {
      selections.setSelectionClients([selections.selectionClients[0]])
    }
    if (selections.selectionProducts.length > 1) {
      selections.setSelectionProducts([selections.selectionProducts[0]])
    }
  }
})

 const changeSelectionMode = () => {
  if (selections.multiSelection === true) {
    if (selections.selectionDepots.length > 1 || selections.selectionClients.length > 1 || selections.selectionProducts.length > 1) {
      showModal()
      return
    }
  }
  selections.setMultiSelection(!selections.multiSelection)
  emit('action')
}

const showModal = () => {
  alert($t('form.multiselection.cbvalue.error'))
}
</script>
