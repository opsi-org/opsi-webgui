<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-form-item>
    <template #label>
      <el-tooltip
        class="box-item"
        effect="light"
        :show-after="1000"
        placement="top-start"
        popper-class="max-h-96 max-w-96 overflow-scroll"
      >
        <template #default>
          <el-text class="truncate mt-3">
            <IconIConfigState :item="props.item">
              <p
                :class="{
                  italic: props.item.anyClientDifferentFromDepot,
                  bold: props.item.anyDepotDifferentFromDefault,
                }"
              >
                {{ transformId(props.item[props.idKey]) }}
              </p>
            </IconIConfigState>
          </el-text>
        </template>

        <template #content>
          <div class="min-w-48">
            <b>{{ props.item[props.idKey] }} <br /></b>
            {{ props.item.description }} <br />
            <br />
            <div v-if="props.item.value !== undefined">
              <b>{{ $t('configValues') }}</b>
              <pre>{{ props.item.value }}</pre>
            </div>
            <div v-if="props.item.defaultValues !== undefined">
              <b>{{ $t('defaultValues') }}</b>
              <pre>{{ props.item.defaultValues }} </pre>
            </div>
            <div v-if="props.item.objects !== undefined">
              <b>{{ $t('objectValues') }}</b>
              <pre>{{ props.item.objects }} </pre>
            </div>
            <div v-if="localPropertyChanges?.length && localPropertyChanges?.length > 0">
              <b>{{ $t('localChanges') }}</b>
              <pre>{{ localPropertyChanges }}</pre>
            </div>
            <pre>
              {{ props.item }}
            </pre>
          </div>
        </template>
      </el-tooltip>
    </template>
    <template #default>
      <div class="w-full contents">
        <el-checkbox
          v-if="props.item[props.boolTypeKey] === boolTypeValue"
          v-model="itemValue"
          :value="itemValue"
        />
        <el-select
          v-else
          v-model="itemValue"
          :multiple="props.item.multiValue"
          :allow-create="props.item.editable"
          :filterable="true"
          default-first-option
          collapse-tags
          collapse-tags-tooltip
          :no-data-text="$t('message.noAvailableOptions')"
          :no-match-text="$t('message.notFound')"
          placeholder=""
          class=""
          :tag-type="undefined"
        >
          <template #default>
            <el-tooltip
              v-for="pVal in props.item[props.allValuesKey]"
              class="box-item"
              effect="dark"
              :key="pVal"
              :content="pVal"
              :show-after="1000"
              placement="top-start"
            >
              <el-option class="max-w-96" :key="pVal" :label="pVal" :value="pVal" />
            </el-tooltip>
          </template>
          <template #header v-if="props.item.editable">
            <el-text> {{ $t('searchOrAdd') }} </el-text>
          </template>
          <template #prefix v-if="props.item.editable">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t('message.pressEnterToAddOrSelect')"
              placement="top-start"
            >
              <el-text><IconIIcon :icon="icons.add" /></el-text>
            </el-tooltip>
          </template>
        </el-select>
        <el-tooltip
          v-if="localPropertyChanges && localPropertyChanges.length > 0"
          class="box-item inline"
          effect="dark"
          placement="top-start"
        >
          <el-alert
            type="warning"
            :closable="false"
            class="min-w-4 max-w-4 p-0 inline after:content-['*']"
          />

          <template #content>
            {{ $t('message.unsavedChanges') }}
            <pre>{{ localPropertyChanges }}</pre>
          </template>
        </el-tooltip>
      </div>
    </template>
  </el-form-item>
</template>

<script setup lang="ts">
  import { useUtils } from '~/composables/mixins/useUtils'
  const $t = useI18n().t
  const icons = useIcons()

  const { changesProducts } = storeToRefs(storeChanges())
  const { selectionDepots, selectionClients } = storeToRefs(storeSelections())
  const $emit = defineEmits(['change'])

  const props = defineProps({
    item: { type: Object, required: true },
    idKey: { type: String, default: 'configId' },
    boolTypeKey: { type: String, default: 'type' },
    boolTypeValue: { type: String, default: 'BoolConfig' },
    allValuesKey: { type: String, default: 'possibleValues' },
    replaceInId: { type: String, default: undefined },
  })

  const itemValue = ref(getVisibleValue(props.item))

  watch(
    () => props.item.value,
    () => {
      itemValue.value = props.item.value
    }
  )

  watch(
    () => itemValue.value,
    () => {
      $emit('change', itemValue.value, getVisibleValue(props.item))
    }
  )
  const localPropertyChanges = ref<Array<any>>()
  getChanges()
  watch(() => changesProducts.value, getChanges, { deep: true })
  function getChanges() {
    const changesPropValues = changesProducts.value?.filter((obj: any) => {
      return (
        obj.productId === props.item.productId &&
        obj.property === props.item.propertyId &&
        (selectionClients.value.includes(obj.clientId) ||
          selectionDepots.value.includes(obj.depotId))
      )
    })
    localPropertyChanges.value = changesPropValues
  }
  function getVisibleValue(item: any) {
    const hasClientValue = Object.keys(item.clients).length > 0
    if (item.allClientValuesEqual && hasClientValue) {
      if (item.multiValue) return Object.values(item.clients)[0]
      return (Object.values(item.clients)[0] as Array<any>)[0]
    } else if (hasClientValue) {
      return 'mixed'
    }

    const hasDepotValue = Object.keys(item.depots).length > 0
    const allDepotsEqual = useUtils().isEqual(Object.values(item.depots))
    if (allDepotsEqual && hasDepotValue) {
      if (item.multiValue) return Object.values(item.depots)[0]
      return (Object.values(item.depots)[0] as Array<any>)[0]
    } else if (hasClientValue) {
      return 'mixed'
    }

    if (item.multiValue) return Object.values(item.default)
    return Object.values(item.default)[0]
  }
  const transformId = (id: string) => {
    if (props.replaceInId) return id.replace(props.replaceInId, '')
    return id
  }
</script>

<style scoped>
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
  }
</style>
