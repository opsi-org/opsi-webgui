<template>
  <el-tabs v-model="activeName" lazy>
    <el-tab-pane :label="$t('form.general')" name="general">
      <FormFAdminGeneral v-if="activeName == 'general'" />
    </el-tab-pane>
    <el-tab-pane :label="$t('label.maintenance')" name="maintenance">
      <FormFAdminMaintenance v-if="activeName == 'maintenance'" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  const $t = useI18n().t

  // const route = useRoute()
  // const router = useRouter()

  const props = defineProps({
    type: { type: String, default: 'general' },
  })
  const activeName = ref(props.type)
  // const pagetype = computed<string>(()=>route.params.pagetype as string)

  // watch(() => activeName.value, (val) => {
  //   console.log('activeName', val)
  //   route.params.pagetype = val
  // })
</script>
