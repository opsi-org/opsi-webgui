<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <IconILoading v-if="isLoadingData || isLoading" />
  <p-multi-select v-if="multiSelection" v-model="localSelectedItems" :max-selected-labels="1" v-bind:options="dataCopy"
    class="w-full justify-stretch text-xs" show-clear size="small" overlay-class="sselect-overlay" data-testId="sselect"
    display="chip">
    <template #option="{ option }">
      <span class="text-xs flex" :class="{
        '!font-bold':
          (isArray(markedOptions) && markedOptions?.includes(option)) || markedOptions == option,
      }">
        <p-button v-if="props.editable && localAddOption.length > 0 && localAddOption == option"
          :label="$t('button.reset')" severity="primary" text size="small" @click.stop="localAddOption = ''">
          <IconIIcon :title="$t('button.reset')" :icon="icons.x" class="m-1" />
        </p-button>
        <p-button v-else-if="props.editable" :label="$t('button.copy')" severity="primary" text size="small"
          @click.stop="copyItemToInput(option)">
          <IconIIcon :title="$t('button.copy')" :icon="icons.copy" class="m-1" />
        </p-button>
        <span class="m-auto">
          {{ option }}
        </span>
      </span>
    </template>

    <template v-if="props.editable" #footer>
      <div class="p-3 flex justify-between text-xs">
        <p-input-text v-model="localAddOption" class="w-full" :placeholder="$t('label.add_new')"
          @keyup.enter="addItemToOptions(localAddOption)" />

        <p-button v-if="props.editable" :label="$t('button.reset')" severity="secondary" text
          @click.stop="localAddOption = ''">
          <IconIIcon :title="$t('button.reset')" :icon="icons.x" class="m-1" />
        </p-button>
        <p-button :label="$t('button.add')" severity="secondary" text :disabled="dataIncludesLocalAddOption()"
          @click="addItemToOptions(localAddOption)">
          <IconIIcon :title="$t('button.add')" :icon="icons.add" class="m-1" />
        </p-button>
      </div>
    </template>
  </p-multi-select>
  <p-select v-else data-testId="sselect" v-model="localSelectedItems" :options="dataCopy" size="small"
    overlay-class="sselect-overlay" class="w-full justify-stretch text-xs">
    <!-- editable -->
    <template #option="{ option }">
      <span class="text-xs max-w-[500px] !flow" :class="{
        '!font-extrabold':
          (isArray(markedOptions) && markedOptions?.includes(option)) || markedOptions == option,
      }">
        <p-button v-if="props.editable && localAddOption.length > 0 && localAddOption == option"
          :label="$t('button.reset')" severity="secondary" text size="small" @click.stop="localAddOption = ''">
          <IconIIcon :title="$t('button.reset')" :icon="icons.x" class="m-1" />
        </p-button>
        <p-button v-else-if="props.editable" :label="$t('button.copy')" severity="secondary" text size="small"
          @click.stop="copyItemToInput(option)">
          <IconIIcon :title="$t('button.copy')" :icon="icons.copy" class="m-1" />
        </p-button>
        <el-text class="m-auto"> {{ option }} </el-text>
      </span>
    </template>
    <template v-if="props.editable" #footer>
      <div class="p-3 flex justify-between text-xs">
        <p-input-text v-model="localAddOption" class="w-full" :placeholder="$t('label.add_new')"
          @keyup.enter="addItemToOptions(localAddOption)" />
        <p-button v-if="props.editable" :label="$t('button.reset')" severity="secondary" text
          @click.stop="localAddOption = ''">
          <IconIIcon :title="$t('button.reset')" :icon="icons.x" class="m-1" />
        </p-button>
        <p-button :label="$t('button.add')" severity="success" text :disabled="dataIncludesLocalAddOption()"
          @click="addItemToOptions(localAddOption)">
          <IconIIcon :title="$t('button.add')" :icon="icons.add" class="m-1" />
        </p-button>
      </div>
    </template>
  </p-select>
</template>

<script setup lang="ts" generic="T extends string | boolean">
const icons = useIcons()
const props = defineProps({
  isLoadingData: {
    type: Boolean,
    default: false,
  },
  infoId: {
    type: String,
    required: false,
    default: '',
  },
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
  allowEmpty: {
    type: Boolean,
    default: false,
  },
})

console.debug('SSelect props', props)

const $emit = defineEmits(['change'])
const data = defineModel<T[]>('data')
const dataCopy = ref<T[]>([...(data.value ?? [])])

const localSelectedItems = defineModel<T | T[]>('selection')
const localAddOption = ref<string>('')
const isLoading = ref(false)

onMounted(() => {
  isLoading.value = true
  if (!props.allowEmpty) {
    assert(data.value !== undefined, 'Data is undefined')
  }
  ///// TODO: Uncaught (in promise) TypeError: Cannot read properties of undefined (reading '0') at ￼SSelect.vue?t=1737468168440:80:141
  assert(
    localSelectedItems.value === undefined ||
    (isArray(localSelectedItems.value) && props.multiSelection == true) ||
    (!isArray(localSelectedItems.value) && props.multiSelection == false),
    `Selection should be array if multiSelection is true (${props.infoId}, multiValue ${props.multiSelection}, selected ${localSelectedItems.value} [${typeof localSelectedItems.value}, isArray ${isArray(
      localSelectedItems.value
    )}])`
  )

  if (localSelectedItems.value === undefined) {
    // init
    localSelectedItems.value = (props.multiSelection ? [] : '') as T | T[]
  }

  if (props.selectedOptions === undefined) {
    isLoading.value = false
    return
  } else if (isArray(props.selectedOptions)) {
    localSelectedItems.value = props.selectedOptions
  } else {
    localSelectedItems.value = props.selectedOptions as T
  }
  initDataCopy()

  isLoading.value = false
})
watch(localAddOption, () => {
  if (localAddOption.value !== undefined && localAddOption.value.length > 0) {
    // filter dataCopy to only include items that match the localAddOption
    dataCopy.value = (data.value ?? []).filter((item) =>
      item.toString().includes(localAddOption.value)
    )
  } else {
    // reset to full dataCopy
    dataCopy.value = [...new Set(data.value ?? [])]
  }
}, { deep: true })

watch(() => localSelectedItems.value,
  () => {
    console.debug('SSelect localSelectedItems changed', localSelectedItems.value)
    $emit('change', localSelectedItems.value)
  }
)

watch(() => props.multiSelection,
  (newValue: boolean) => {
    if (newValue == false) {
      if (
        localSelectedItems.value !== undefined &&
        isArray(localSelectedItems.value) &&
        localSelectedItems.value.length > 0
      ) {
        localSelectedItems.value = localSelectedItems.value[0] as T
      }
    } else {
      localSelectedItems.value = [localSelectedItems.value as T]
    }
  },
  { deep: true }
)


function initDataCopy() {
  if (props.multiSelection)
    dataCopy.value = [...new Set([...(data.value as T[]), ...(localSelectedItems.value as T[])])]
  else
    dataCopy.value = [...new Set([...(data.value as T[]), localSelectedItems.value as T])]

  if (dataCopy.value !== undefined) {
    dataCopy.value?.sort((a: any, b: any) =>
      // cannot be undefined because of assert
      a.toString().localeCompare(b, undefined, { numeric: true })
    )
  }
}

function dataIncludesLocalAddOption() {
  return (
    localAddOption.value !== undefined &&
    (data.value as string[]).includes(localAddOption.value)
  )
}
function copyItemToInput(item: string) {
  localAddOption.value = item
}
function addItemToOptions(item: string) {
  if (!(dataCopy.value as string[]).includes(item)) {
    ; (data.value as string[]).push(item)
      ; (dataCopy.value as string[]).push(item)
    data.value = [...new Set(data.value)]
    dataCopy.value = [...new Set(dataCopy.value)]
    dataCopy.value.sort((a: any, b: any) =>
      a.toString().localeCompare(b, undefined, { numeric: true })
    )
  }

  selectOptionIfNotAlready(item)
  // $emit('change')
}

function selectOptionIfNotAlready(item: string) {
  // init if not already
  if (localSelectedItems.value === undefined) {
    localSelectedItems.value = props.multiSelection ? [] : ('' as T)
  }

  // bug (reproduction: page=server-configs; config=clientconfig.configserver.url;
  // value=<click directly on button 'add' to add empty icon> ===> this will update
  // markedOptions and itemValues/initialValues in fhostparameter... this should not happen

  // // select if not already
  // if (
  //   isArray(localSelectedItems.value) &&
  //   !localSelectedItems.value.includes(item as T)
  // ) {
  //   localSelectedItems.value.push(item as T)
  //   // remove
  // } else
  if (!props.multiSelection) {
    localSelectedItems.value = item as T
    data.value?.push(item as T)
  }
  else if (
    isArray(localSelectedItems.value) &&
    !localSelectedItems.value.includes(item as T)
  ) {
    localSelectedItems.value.push(item as T)
    data.value?.push(item as T)

  }
  if (!props.multiSelection) {
    localSelectedItems.value = item as T
  }
  //$emit('change', localSelectedItems.value)
}
</script>
