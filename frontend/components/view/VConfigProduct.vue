<template>
  <el-form
    label-width="50%"
    :label-position="mq.isMobile.value ? 'top' : 'left'"
  >
    <el-form-item :label="$t('table.fields.version')">
      {{
        getVersion(
          fetchedData.properties.productVersions ||
            fetchedData.dependencies.productVersions,
        )
      }}
    </el-form-item>
    <el-form-item :label="$t('table.fields.description')">
      <Markdown>
        {{
          fetchedData.properties.productDescription ||
          fetchedData.dependencies.productDescription
        }}
      </Markdown>
    </el-form-item>
    <el-form-item :label="$t('table.fields.advice')">
      <Markdown>
        {{
          fetchedData.properties.productAdvice ||
          fetchedData.dependencies.productAdvice
        }}
      </Markdown>
    </el-form-item>
  </el-form>
  <el-alert
    v-if="selectionClients.length <= 0"
    :title="$t('message.warning.noClientsSelectedShowDepot')"
    type="warning"
    show-icon
  />
  <el-alert
    v-if="productVersionsCount !== selectionDepots.length"
    :title="
      $t('message.warning.notOnEachDepot', {
        count: productVersionsCount,
        countall: selectionDepots.length,
      })
    "
    type="warning"
    show-icon
  />
  <el-alert
    v-if="hasDifferentProductVersions"
    :title="$t('message.warning.differentProductVersions')"
    type="warning"
    show-icon
  />
  <el-tabs v-else v-model="activeName" class="demo-tabs" v-loading="isLoading">
    <el-tab-pane
      name="properties"
      :label="
        $t('title.prodproperties') +
        ' ' +
        (Object.keys(fetchedData.properties.properties).length !== 0
          ? ''
          : $t('title.dependenciesEmpty'))
      "
      :disabled="Object.keys(fetchedData.properties.properties).length === 0"
      active
    >
      <ViewVConfigProductProperty
        :properties="fetchedData.properties.properties"
      />
      {{ errorText.properties }}
    </el-tab-pane>
    <el-tab-pane
      name="dependencies"
      :label="
        $t('title.dependencies') +
        ' ' +
        (hasDependencies ? '' : $t('title.dependenciesEmpty'))
      "
      :disabled="!hasDependencies"
    >
      <ViewVConfigProductDependencies
        :dependencies="fetchedData.dependencies"
      />
      {{ errorText.dependencies }}
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useUtils } from '~/composables/mixins/useUtils'
  import type {
    T_ProductPropertiesResult,
    T_ProductDependenciesResult,
    T_ProductPropertiesDependenciesResult,
  } from '~/types/APItypes'
  import type { IErrorDepProp } from '~/types/tobjects'

  const { notifyError } = useNotification()
  const $t = useI18n().t
  const mq = useMQ()
  const isLoading = ref(true)
  const tableSettings = storeTablesettings()
  const { configLastSelected } = storeToRefs(tableSettings)

  const props = defineProps({
    id: { type: String, default: undefined }, // productId
    type: { type: String, default: 'product' },
    isChild: { type: Boolean, default: true },
  })

  const errorText = ref<IErrorDepProp>({ dependencies: '', properties: '' })
  const activeName = ref(
    props.isChild
      ? configLastSelected.value[props.type] || 'properties'
      : 'properties',
  )

  watch(
    () => activeName.value,
    () => {
      if (props.isChild) {
        tableSettings.setConfigLastSelected(props.type, activeName.value)
      }
    },
  )

  const fetchedData = ref<T_ProductPropertiesDependenciesResult>({
    dependencies: {
      dependencies: [],
      productVersions: {},
      productDescription: '',
      productDescriptionDetails: {},
      productAdvice: '',
      productAdviceDetails: {},
    },
    properties: {
      properties: {},
      productVersions: {},
      productDescription: '',
      productDescriptionDetails: {},
      productAdvice: '',
      productAdviceDetails: {},
    },
  })

  const dataSelection = storeSelections()
  const { selectionDepots, selectionClients } = storeToRefs(dataSelection)

  watch([selectionDepots, selectionClients, () => props.id], fetch, {
    deep: true,
  })

  onMounted(fetch)

  async function fetch() {
    isLoading.value = true
    errorText.value = { dependencies: '', properties: '' }

    await Promise.all([fetchProperties(), fetchDependencies()])
    isLoading.value = false
  }

  async function fetchProperties() {
    const { data, error } = await useApiGETBody<T_ProductPropertiesResult>(
      `/opsidata/products/${props.id}/properties`,
      {
        selectedDepots: `[${selectionDepots.value.toString()}]`,
        selectedClients: `[${selectionClients.value.toString()}]`,
      },
    )

    if (error) {
      handleError(error, 'properties')
      return
    }

    if (!data.value) {
      notifyError({
        message: $t('message.error.empty-response', {
          details: 'ConfigProductProperties',
        }),
      })
      return
    }

    fetchedData.value.properties = data.value
  }

  async function fetchDependencies() {
    const { data, error } = await useApiGETBody<T_ProductDependenciesResult>(
      `/opsidata/products/${props.id}/dependencies`,
      {
        selectedDepots: `[${selectionDepots.value.toString()}]`,
        selectedClients: `[${selectionClients.value.toString()}]`,
      },
    )

    if (error) {
      handleError(error, 'dependencies')
      return
    }

    if (!data.value) {
      notifyError({
        message: $t('message.error.empty-response', {
          details: 'ConfigProductDependencies',
        }),
      })
      return
    }

    fetchedData.value.dependencies = data.value
  }

  function handleError(error: any, type: 'properties' | 'dependencies') {
    console.error(error)
    notifyError({ message: error?.response?.data?.message })
    errorText.value[type] = error.response.data.message
  }

  function getVersion(versions: any) {
    const versionValues = Object.values(versions)
    if (versionValues.length > 0) {
      return useUtils().isEqual(versionValues) ? versionValues[0] : 'mixed'
    }
    return 'undefined'
  }

  const productVersionsCount = computed(
    () =>
      Object.values(fetchedData.value.properties.productVersions).filter(
        Boolean,
      ).length,
  )
  const hasDifferentProductVersions = computed(() =>
    Object.values(fetchedData.value.properties.productVersions)
      .filter(Boolean)
      .some((v, _, arr) => v !== arr[0]),
  )
  const hasDependencies = computed(
    () => fetchedData.value.dependencies.dependencies?.length > 0,
  )
</script>
