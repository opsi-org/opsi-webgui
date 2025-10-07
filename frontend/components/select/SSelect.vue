<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <IconILoading v-if="isLoadingData || isLoading" />
  <p-multi-select
    ref="sselect"
    v-if="multiSelection"
    v-model="localSelectedItems"
    :max-selected-labels="1"
    :options="dataCopy"
    :disabled="disabled"
    style="max-width: calc(100vw - 120px)"
    class="sselect flex w-full justify-stretch text-xs"
    show-clear
    size="small"
    overlay-class="sselect-overlay"
    data-testId="sselect"
    display="chip"
    v-p-tooltip="{ value: localSelectedItems?.toString(), autoHide: false }"
  >
    <template #option="{ option }">
      <span
        class="text-xs flex"
        :class="{
          '!font-bold':
            (isArray(markedOptions) && markedOptions?.includes(option)) || markedOptions == option,
          'sselect-option-wrapper': true,
          'sselect-highlight': editItemDialogLastValue == option,
        }"
        :style="{
          '--p-multiselect-option-focus-background': 'var(--cyan-500)',
        }"
      >
        <p-button
          v-if="props.editable && localAddOption.length > 0 && localAddOption == option"
          :label="$t('reset')"
          severity="primary"
          text
          size="small"
          @click.stop="localAddOption = ''"
        >
          <IconIIcon :title="$t('reset')" :icon="icons.x" class="m-1" />
        </p-button>
        <p-button
          v-else-if="props.editable"
          :label="$t('copy')"
          severity="primary"
          text
          size="small"
          @click.stop="copyItemToInput(option)"
        >
          <IconIIcon :title="$t('copy')" :icon="icons.copy" class="m-1" />
        </p-button>
        <p-button
          v-if="props.editable && props.editableMultiline"
          :label="$t('edit')"
          severity="secondary"
          text
          size="small"
          @click.stop="showEditItemDialog(option, true)"
        >
          <IconIIcon :title="$t('edit')" :icon="icons.edit" class="m-1" />
        </p-button>
        <span class="mt-2">{{ option.replace('\n', '\\n') }}</span>
      </span>
    </template>

    <template v-if="props.editable" #footer>
      <div class="p-3 flex justify-between text-xs">
        <p-input-text
          v-model="localAddOption"
          class="w-full"
          :placeholder="$t('addNew')"
          @keyup.enter="addItemToOptions(localAddOption, false)"
        />

        <p-button
          v-if="props.editable"
          :label="$t('reset')"
          severity="secondary"
          text
          @click.stop="localAddOption = ''"
        >
          <IconIIcon :title="$t('reset')" :icon="icons.x" class="m-1" />
        </p-button>

        <p-button
          v-if="props.editableMultiline"
          :label="$t('edit')"
          severity="secondary"
          text
          size="small"
          @click.stop="showEditItemDialog(localAddOption, false)"
        >
          <IconIIcon :title="$t('edit')" :icon="icons.edit" class="m-1" />
        </p-button>
        <p-button
          :label="$t('add')"
          severity="secondary"
          text
          :disabled="dataIncludesLocalAddOption()"
          @click="addItemToOptions(localAddOption, false)"
        >
          <IconIIcon :title="$t('add')" :icon="icons.add" class="m-1" />
        </p-button>
      </div>
    </template>
  </p-multi-select>
  <p-select
    v-else
    ref="sselect"
    data-testId="sselect"
    v-model="localSelectedItems"
    v-p-tooltip="{ value: localSelectedItems?.toString(), autoHide: false }"
    :options="dataCopy"
    :disabled="disabled"
    size="small"
    style="max-width: calc(100vw - 120px)"
    overlay-class="sselect-overlay"
    class="sselect flex w-full justify-stretch text-xs"
  >
    <!-- editable -->
    <template #option="{ option }">
      <span
        class="text-xs max-w-[500px] !flow"
        :class="{
          '!font-extrabold':
            (isArray(markedOptions) && markedOptions?.includes(option)) || markedOptions == option,
        }"
      >
        <p-button
          v-if="props.editable && localAddOption.length > 0 && localAddOption == option"
          :label="$t('reset')"
          severity="secondary"
          text
          size="small"
          @mousedown.stop
          @click.stop.prevent="localAddOption = ''"
        >
          <IconIIcon :title="$t('reset')" :icon="icons.x" class="m-1" />
        </p-button>
        <p-button
          v-else-if="props.editable"
          :label="$t('copy')"
          severity="secondary"
          text
          size="small"
          @mousedown.stop
          @click.stop.prevent="copyItemToInput(option)"
        >
          <IconIIcon :title="$t('copy')" :icon="icons.copy" class="m-1" />
        </p-button>
        <p-button
          v-if="props.editable && props.editableMultiline"
          :label="$t('edit')"
          severity="secondary"
          text
          size="small"
          @click.stop="showEditItemDialog(option, true)"
        >
          <IconIIcon :title="$t('edit')" :icon="icons.edit" class="m-1" />
        </p-button>
        <el-text class="m-auto" :title="option"> {{ option }} </el-text>
      </span>
    </template>
    <template v-if="props.editable" #footer>
      <div class="p-3 flex justify-between text-xs">
        <p-input-text
          v-model="localAddOption"
          class="w-full"
          :placeholder="$t('addNew')"
          @keyup.enter="addItemToOptions(localAddOption, false)"
        />
        <p-button
          v-if="props.editable"
          :label="$t('reset')"
          severity="secondary"
          text
          @click.stop="localAddOption = ''"
        >
          <IconIIcon :title="$t('reset')" :icon="icons.x" class="m-1" />
        </p-button>

        <p-button
          v-if="props.editableMultiline"
          :label="$t('edit')"
          severity="secondary"
          text
          size="small"
          @click.stop="showEditItemDialog(localAddOption, false)"
        >
          <IconIIcon :title="$t('edit')" :icon="icons.edit" class="m-1" />
        </p-button>
        <p-button
          :label="$t('add')"
          severity="success"
          text
          :disabled="dataIncludesLocalAddOption()"
          @click="addItemToOptions(localAddOption, false)"
        >
          <IconIIcon :title="$t('add')" :icon="icons.add" class="m-1" />
        </p-button>
      </div>
    </template>
  </p-select>
  <p-dialog
    v-model:visible="editItemDialogVisible"
    modal
    :closeable="false"
    :header="editItemDialogUpdate ? $t('editItem') : $t('addItem')"
    :style="{ width: '50vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <p-textarea v-model="editItemDialogValue" rows="5" class="w-full border-1 border-cyan-500" />
    <pre>{{ dataCopy }}</pre>
    <div class="flex justify-end gap-2">
      <p-button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="editItemDialogVisible = false"
      ></p-button>
      <p-button
        type="button"
        label="Save"
        @click="
          () => {
            if (editItemDialogUpdate) {
              console.log('update item', editItemDialogValueOrigin, 'to', editItemDialogValue)
              updateItemInOptions(editItemDialogValueOrigin, editItemDialogValue, false, true)
            } else {
              // add
              addItemToOptions(editItemDialogValue, false, true)
            }
          }
        "
      ></p-button>
    </div>
  </p-dialog>
</template>

<script setup lang="ts" generic="T extends string | boolean">
  const icons = useIcons()
  const props = defineProps({
    isLoadingData: {
      type: Boolean,
      default: false,
    },
    disabled: {
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
    editableMultiline: {
      type: Boolean,
      default: true,
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

  const $emit = defineEmits(['change'])
  const data = defineModel<T[]>('data')
  const dataCopy = ref<T[]>([...(data.value ?? [])])

  const localSelectedItems = defineModel<T | T[]>('selection')
  const localAddOption = ref<string>('')
  const isLoading = ref(false)
  const sselect = ref<any>(null)
  const editItemDialogVisible = ref(false)
  const editItemDialogUpdate = ref(false)
  const editItemDialogLastValue = ref<string>('')
  const editItemDialogValue = ref<string>('')
  const editItemDialogValueOrigin = ref<string>('')

  onMounted(() => {
    isLoading.value = true
    dataCopy.value = [...(data.value ?? [])]

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

  watch(
    () => localAddOption.value,
    () => {
      if (localAddOption.value !== undefined && localAddOption.value.length > 0) {
        // filter dataCopy to only include items that match the localAddOption
        dataCopy.value = (data.value ?? []).filter((item) =>
          item.toString().includes(localAddOption.value)
        )
      } else {
        // reset to full dataCopy
        dataCopy.value = [...new Set(data.value ?? [])]
      }
    },
    { deep: true }
  )

  watch(
    () => localSelectedItems.value,
    () => {
      $emit('change', localSelectedItems.value)
    },
    { deep: true }
  )

  watch(
    () => data.value,
    () => {
      initDataCopy()
    }
  )

  watch(
    () => props.multiSelection,
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
  watch(
    () => editItemDialogLastValue.value,
    (newValue) => {
      if (newValue === undefined || newValue.length <= 0) return
      // highlight item in options for 2 seconds
      /*setTimeout(() => {
        editItemDialogLastValue.value = ''
      }, 2000)*/
    }
  )

  function initDataCopy() {
    if (props.multiSelection)
      dataCopy.value = [...new Set([...(data.value as T[]), ...(localSelectedItems.value as T[])])]
    else dataCopy.value = [...new Set([...(data.value as T[]), localSelectedItems.value as T])]

    if (dataCopy.value !== undefined) {
      dataCopy.value?.sort((a: any, b: any) =>
        // cannot be undefined because of assert
        a.toString().localeCompare(b, undefined, { numeric: true })
      )
    }
  }

  function dataIncludesLocalAddOption() {
    return (
      localAddOption.value !== undefined && (data.value as string[]).includes(localAddOption.value)
    )
  }
  function copyItemToInput(item: string) {
    localAddOption.value = item
  }
  function updateItemInOptions(
    oldItem: string,
    newItem: string,
    store: boolean = true,
    openOptions: boolean = false
  ) {
    console.log('updateItemInOptions', oldItem, newItem)
    const index = (dataCopy.value as string[]).indexOf(oldItem)
    console.log('updateItemInOptions', oldItem, index)
    if (index !== -1) {
      // remove old item
      ;(dataCopy.value as string[]).splice(index, 1)
      // add new item
      ;(dataCopy.value as string[]).push(newItem)
      // sort
      //dataCopy.value = [...new Set(dataCopy.value)]
      dataCopy.value.sort((a: any, b: any) =>
        a.toString().localeCompare(b, undefined, { numeric: true })
      )
    }
    if (store) selectOptionIfNotAlready(newItem, store)
    editItemDialogVisible.value = false
    if (openOptions) {
      editItemDialogLastValue.value = newItem
      sselect.value?.show()
    }
  }
  function addItemToOptions(item: string, store: boolean = true, openOptions: boolean = false) {
    if (!(dataCopy.value as string[]).includes(item)) {
      ;(data.value as string[]).push(item)
      ;(dataCopy.value as string[]).push(item)
      data.value = [...new Set(data.value)]
      dataCopy.value = [...new Set(dataCopy.value)]
      dataCopy.value.sort((a: any, b: any) =>
        a.toString().localeCompare(b, undefined, { numeric: true })
      )
    }

    localAddOption.value = ''
    // $emit('change')

    if (store) selectOptionIfNotAlready(item, store)
    editItemDialogVisible.value = false
    if (openOptions) {
      editItemDialogLastValue.value = item
      sselect.value?.show()
    }
  }

  function selectOptionIfNotAlready(item: string, store: boolean = true) {
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
      if (store) data.value?.push(item as T)
    } else if (isArray(localSelectedItems.value) && !localSelectedItems.value.includes(item as T)) {
      localSelectedItems.value.push(item as T)
      data.value?.push(item as T)
    }
    if (store) $emit('change', localSelectedItems.value)
  }

  function showEditItemDialog(item: string, update = false) {
    editItemDialogUpdate.value = update
    if (item === undefined || item.length <= 0) {
      item = ''
    }
    editItemDialogVisible.value = true
    editItemDialogValue.value = item
    editItemDialogValueOrigin.value = item
  }
</script>
<style scoped lang="css">
  :deep(.sselect-overlay) {
    max-width: calc(100vw - 20px) !important;
  }
  :deep(.sselect-option-wrapper) {
    transition: all 0.4s ease-out;
    opacity: 0;
    height: 2em;
  }
  :deep(.sselect-option-wrapper.sselect-highlight) {
    opacity: 1;
  }
</style>
