<template>
  <PMultiSelect
    v-if="multiSelection"
    v-model="localSelectedServers"
    :options="data"
    :max-selected-labels="1"
    class="w-full justify-stretch"
    show-clear
    display="chip"
  >
    <template #option="{ option }">
      <span :class="{ '!font-bold': markedOption === option }">{{
        option
      }}</span>
    </template>
  </PMultiSelect>
  <PSelect
    v-else
    v-model="localSelectedServer"
    :options="data"
    class="w-full justify-stretch"
  >
    <template #option="{ option }">
      <span :class="{ '!font-bold': markedOption === option }">{{
        option
      }}</span>
    </template>
  </PSelect>
</template>

<script setup lang="ts">
  const props = defineProps({
    data: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    multiSelection: {
      type: Boolean,
      default: false,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    selectedOption: {
      type: Object as PropType<string | Array<string>>,
      default: undefined,
    },
    markedOption: {
      type: String,
      default: undefined,
    },
  })
  const localSelectedServers = defineModel<Array<string>>()
  const localSelectedServer = ref<string>()
  onMounted(() => {
    if (props.selectedOption === undefined) {
      return
    }
    if (!props.multiSelection && !Array.isArray(props.selectedOption)) {
      localSelectedServer.value = props.selectedOption
      localSelectedServers.value = [props.selectedOption]
      return
    }
    if (props.multiSelection && Array.isArray(props.selectedOption)) {
      localSelectedServers.value = props.selectedOption
      return
    }
    if (props.multiSelection && !Array.isArray(props.selectedOption)) {
      localSelectedServers.value = [props.selectedOption]
      return
    }
    throw new Error(
      'Selected option is an array ' +
        Array.isArray(props.selectedOption) +
        ' but multiSelection is ' +
        props.multiSelection,
    )
  })

  watch(
    () => localSelectedServer.value,
    (val) => {
      if (val) {
        localSelectedServers.value = [val]
      }
    },
  )
</script>
