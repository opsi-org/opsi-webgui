<template>
  <SelectSHosts
    v-if="props.isChild === false"
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
      active
      :disabled="!(type == 'clients' || type == 'servers')"
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
      <el-scrollbar>
        <FormFHostAttributes
          :id="currentId"
          :type="type"
          :is-child="props.isChild"
        />
      </el-scrollbar>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  import type { PropTypeServerClient } from '~/types/tproptypes'

  const tableSettings = storeTablesettings()
  const { configLastSelected } = storeToRefs(tableSettings)
  const $t = useI18n().t

  const currentId = ref<string | undefined>('')
  const props = defineProps({
    id: { type: String, default: undefined },
    type: {
      type: String as PropType<PropTypeServerClient>,
      default: 'servers',
    },
    isChild: { type: Boolean, default: false },
  })
  // console.debug('VConfig', props.id, props.type, props.isChild)

  currentId.value = props.id
  const activeName = ref(configLastSelected.value[props.type] || 'config')
  // const activeName = ref(configLastSelected.value[props.type] || (props.isChild? 'config':'attr'))

  watch(
    () => props.id,
    () => {
      currentId.value = props.id
      if (isIdEmpty.value && activeName.value !== 'config') {
        activeName.value = 'config'
      }
    },
  )
  watch(
    () => activeName.value,
    () => {
      tableSettings.setConfigLastSelected(props.type, activeName.value)
      // if (props.isChild){
      //   // store last selected tab if used as child
      // }
    },
  )

  const isIdEmpty = computed(() => {
    return currentId.value === ''
  })
  function setId(id: string) {
    currentId.value = id
  }
</script>
