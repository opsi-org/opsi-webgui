<template>
  <el-select
    v-model="value"
    clearable
    :placeholder="$t('formselect.select.' + type)"
    style="min-width: 200px"
  >
    <el-option
      v-for="item in fetchedData"
      :key="item"
      :label="item"
      :value="item"
    />
  </el-select>
  <!-- {{ useRoute().name }} -->
</template>

<script setup lang="tsx">
  import { useClient, useDepot } from '~/composables/mixins/useGet'
  const $t = useI18n().t
  const storeSel = storeSelections()
  const fetchedData = ref<Array<any>>([])
  const value = ref<string | undefined>()
  const props = defineProps({
    id: { type: String, default: undefined },
    type: { type: String, default: 'servers' },
  })
  const emit = defineEmits(['update:value'])
  onMounted(async () => {
    await fetch()
    // if (props.id)
    value.value = props.id
  })
  watch(
    () => value.value,
    () => {
      // const pathArr = useRoute().path.split('/').filter(v => v !== '')
      switch (useRoute().name) {
        case 'clients-config':
          useRouter().push({
            name: 'clients-config-id',
            params: { id: value.value as string },
          })
          break
        case 'servers-config':
          useRouter().push({
            name: 'servers-config-id',
            params: { id: value.value as string },
          })
          break
        case 'clients-config-id':
          useRouter().push({
            name: 'clients-config-id',
            params: { id: value.value as string },
          })
          break
        case 'clients-logs':
          useRouter().push({
            name: 'clients-logs-id',
            params: { id: value.value as string },
          })
          break
        case 'clients-logs-id':
          useRouter().push({
            name: 'clients-logs-id',
            params: { id: value.value as string },
          })
          break
        case 'servers-config-id':
          useRouter().push({
            name: 'servers-config-id',
            params: { id: value.value as string },
          })
          break

        default:
          break
      }

      emit('update:value', value.value)
    },
  )
  async function fetch() {
    if (props.type === 'servers') {
      const dataSorted = await useDepot($t).getDepotIdList()
      fetchedData.value = dataSorted
    } else if (props.type === 'clients') {
      const dataSorted = await useClient().getClientIdList(
        storeSel.selectionDepots,
      )
      fetchedData.value = dataSorted
    }
  }
</script>
