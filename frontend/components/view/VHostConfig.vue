<template>
  <SelectSHosts
    v-if="!props.isChild"
    :id="currentId"
    :type="type"
    @change="setId"
  />
  <el-tabs v-model="activeName">
    <el-tab-pane
      :label="
        currentId ? $t('title.hostparam') : $t('title.hostparam.defaults')
      "
      name="config"
      :disabled="!(type === 'clients' || type === 'servers')"
    >
      <FormFHostParameter
        v-if="activeName === 'config'"
        :id="currentId"
        :type="type"
        :is-child="props.isChild"
      />
    </el-tab-pane>
    <el-tab-pane
      :label="$t('title.hostattr')"
      name="attr"
      :disabled="isIdEmpty"
    >
      <FormFHostAttributes
        :id="currentId"
        :type="type"
        :is-child="props.isChild"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  import type { PropTypeServerClient } from '~/types/tproptypes'

  const tableSettings = storeTablesettings()
  const { configLastSelected } = storeToRefs(tableSettings)
  const $t = useI18n().t

  const props = defineProps({
    id: { type: String, default: undefined },
    type: {
      type: String as PropType<PropTypeServerClient>,
      default: 'servers',
    },
    isChild: { type: Boolean, default: false },
  })

  const currentId = ref<string | undefined>(props.id)
  const activeName = ref(configLastSelected.value[props.type] || 'config')

  watch(
    () => props.id,
    (newId) => {
      currentId.value = newId
      if (isIdEmpty.value && activeName.value !== 'config') {
        activeName.value = 'config'
      }
    },
  )

  watch(
    () => activeName.value,
    (newActiveName) => {
      tableSettings.setConfigLastSelected(props.type, newActiveName)
    },
  )

  const isIdEmpty = computed(() => !currentId.value)

  function setId(id: string) {
    currentId.value = id
  }
</script>
