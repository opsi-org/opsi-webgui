<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-tabs lazy @tab-click="handleTabClick" v-model="currentType">
    <el-tab-pane
      v-for="category in groupActions"
      :key="category.category"
      :label="$t(category.category)"
      :name="category.category"
    >
      <TreeTGroupActions v-if="category.category === currentType" :data="category" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  const props = defineProps({
    type: { type: String, required: false, default: 'client-group' },
  })

  const $t = useI18n().t
  const router = useRouter()

  const currentType = ref(props.type)

  const groupActions = reactive([
    {
      category: 'client-group',
      actions: {
        maingroups: ['group-add'],
        parent: ['edit', 'delete', 'client-delete', 'client-add', 'group-add'], // $t('client-delete.confirm'), $t('delete.confirm')
        children: ['delete', 'copy'],
      },
    },
    {
      category: 'product-group',
      actions: {
        // parent: [ 'edit', 'delete', 'product-delete', 'product-add', 'group-add' ] // TODO: enable if #767 is solved
        parent: ['delete', 'product-delete', 'product-add'], // $t('product-delete.confirm')
        children: ['delete'],
      },
    },
  ])

  const handleTabClick = (pane: { props: { name?: string | number } }) => {
    const selectedCategory = pane.props.name
    currentType.value = selectedCategory as string
    router.push({ path: `/groups/${selectedCategory}` })
  }

  watch(
    () => props.type,
    (newType) => {
      if (currentType.value !== newType) {
        currentType.value = newType
        if (router.currentRoute.value.path !== `/groups/${newType}`) {
          router.push({ path: `/groups/${newType}` })
        }
      }
    }
  )

  onMounted(() => {
    if (router.currentRoute.value.path !== `/groups/${currentType.value}`) {
      router.push({ path: `/groups/${currentType.value}` })
    }
  })
</script>
