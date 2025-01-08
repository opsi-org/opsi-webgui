<template>
  <PMultiSelect
    v-if="multiSelection"
    v-model="localSelectedItems"
    :options="data"
    :max-selected-labels="1"
    class="w-full justify-stretch"
    show-clear
    display="chip"
  >
    <!-- @change="() => $emit('change', localSelectedItems)" -->
    <template #option="{ option }">
      <span
        :class="{
          '!font-bold':
            (isArray(markedOptions) && markedOptions?.includes(option)) ||
            markedOptions == option,
        }"
        >{{ option }}</span
      >
    </template>

    <template v-if="props.editable" #footer>
      <div class="p-3 flex justify-between">
        <PInputText
          v-model="localAddOption"
          class="w-full"
          :placeholder="$t('label.add_new')"
          @keyup.enter="addItemToOptions(localAddOption)"
        />
        <PButton
          :label="$t('button.add')"
          severity="secondary"
          text
          size="small"
          @click="addItemToOptions(localAddOption)"
        >
          <IconIIcon :icon="icons.add" />
        </PButton>
      </div>
    </template>
  </PMultiSelect>
  <PSelect
    v-else
    v-model="localSelectedItems"
    :options="data"
    class="w-full justify-stretch"
  >
    <!-- editable -->
    <template #option="{ option }">
      <span
        :class="{
          '!font-bold':
            (isArray(markedOptions) && markedOptions?.includes(option)) ||
            markedOptions == option,
        }"
        >{{ option }}</span
      >
    </template>
    <template v-if="props.editable" #footer>
      <div class="p-3 flex justify-between">
        <PInputText
          v-model="localAddOption"
          class="w-full"
          :placeholder="$t('label.add_new')"
          @keyup.enter="addItemToOptions(localAddOption)"
        />
        <PButton
          :label="$t('button.add')"
          severity="secondary"
          text
          size="small"
          icon="pi pi-plus"
          @click="addItemToOptions(localAddOption)"
        />
      </div>
    </template>
  </PSelect>
</template>

<script setup lang="ts" generic="T extends string | boolean">
  const icons = useIcons()
  // const props = withDefaults(
  //   defineProps<{
  //     // data: T[]
  //     selectedOptions?: T | T[]
  //     markedOptions?: T | T[]
  //     multiSelection?: boolean
  //     editable?: boolean
  //   }>(),
  //   {
  //     selectedOptions: undefined,
  //     markedOptions: undefined,
  //     multiSelection: false,
  //     editable: false,
  //   },
  // )
  const props = defineProps({
    multiSelection: {
      type: Boolean,
      default: false,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    selectedOptions: {
      type: [String, Array] as PropType<T | T[]>,
      default: undefined,
      validator: ({
        multiSelection,
        selectedOptions,
      }: {
        multiSelection: boolean
        selectedOptions: T | T[]
      }) => {
        return (
          selectedOptions === undefined ||
          (multiSelection && isArray(selectedOptions)) ||
          (!multiSelection && !isArray(selectedOptions))
        )
      },
    },
    markedOptions: {
      type: [String, Array] as PropType<T | T[]>,
      default: undefined,
      validator: ({
        multiSelection,
        markedOptions,
      }: {
        multiSelection: boolean
        markedOptions: T | T[]
      }) => {
        return (
          markedOptions === undefined ||
          (multiSelection && isArray(markedOptions)) ||
          (!multiSelection && !isArray(markedOptions))
        )
      },
    },
  })

  const $emit = defineEmits(['change'])
  const data = defineModel<T[]>('data')
  const localAddOption = ref<string>('')
  const localSelectedItems = defineModel<T | T[]>('selection')

  onMounted(() => {
    assert(data.value !== undefined, 'Data is undefined')
    assert(
      localSelectedItems.value === undefined ||
        (isArray(localSelectedItems.value) && props.multiSelection) ||
        (!isArray(localSelectedItems.value) && !props.multiSelection),
      'Selection should be array if multiSelection is true',
    )

    data.value?.sort((a: any, b: any) =>
      // cannot be undefined because of assert
      a.localeCompare(b, undefined, { numeric: true }),
    )

    if (localSelectedItems.value === undefined) {
      // init
      localSelectedItems.value = (props.multiSelection ? [] : '') as T | T[]
    }

    if (props.selectedOptions === undefined) {
      return
    } else if (isArray(props.selectedOptions)) {
      localSelectedItems.value = props.selectedOptions
      // localSelectedItems.value = [...props.selectedOptions]
    } else {
      localSelectedItems.value = props.selectedOptions as T
    }
  })

  watch(
    localSelectedItems,
    () => {
      $emit('change')
    },
    { deep: true },
  )
  function addItemToOptions(item: string) {
    if (!(data.value as string[]).includes(item)) {
      ;(data.value as string[]).push(item)
    }

    selectOptionIfNotAlready(item)
    // $emit('change')
  }

  function selectOptionIfNotAlready(item: string) {
    // init if not already
    if (localSelectedItems.value === undefined) {
      localSelectedItems.value = props.multiSelection ? [] : ('' as T)
    }
    // select if not already
    if (
      isArray(localSelectedItems.value) &&
      !localSelectedItems.value.includes(item as T)
    ) {
      localSelectedItems.value.push(item as T)
    } else if (!props.multiSelection) {
      localSelectedItems.value = item as T
    }
  }
</script>
