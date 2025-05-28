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
      :label="$t('title.' + category.category)"
      :name="category.category"
    >
      <TreeTGroupActions v-if="category.category === currentType" :data="category" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  const props = defineProps({
    type: { type: String, required: true, default: 'client-group' },
  })

  const $t = useI18n().t
  const router = useRouter()

  const currentType = ref(props.type)

  const groupActions = reactive([
    {
      category: 'client-group', // for i18n-check: $t('title.client-group')
      actions: {
        maingroups: ['group-add'], // for i18n-check: $t('group.group-add')
        parent: ['edit', 'delete', 'client-delete', 'client-add', 'group-add'], // for i18n-check: $t('group.edit'), $t('group.delete'), $t('group.client-delete'), $t('group.client-add'), $t('group.group-add'), $t('group.confirm.client-delete'), $t('group.confirm.delete')
        children: ['delete', 'copy'], // for i18n-check: $t('group.delete'), $t('group.copy')
      },
    },
    {
      category: 'product-group', // for i18n-check: $t('title.product-group')
      actions: {
        // parent: [ 'edit', 'delete', 'product-delete', 'product-add', 'group-add' ] // TODO: enable if #767 is solved, for i18n-check: $t('group.edit'), $t('group.delete'), $t('group.product-delete'), $t('group.product-add'), $t('group.group-add'), $('group.confirm.delete'), $('group.confirm.product-delete')
        parent: ['delete', 'product-delete', 'product-add'], // for i18n-check: $t('group.delete'), $t('group.product-delete'), $t('group.product-add')
        children: ['delete'], // for i18n-check: $t('group.delete')
      },
    },
  ])

  const handleTabClick = (pane: { props: { name?: string | number } }) => {
    const selectedCategory = pane.props.name
    if (currentType.value !== selectedCategory) {
      currentType.value = selectedCategory as string
      router.push({ path: `/groups/${selectedCategory}` })
    }
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
