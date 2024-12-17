<template>
  <el-tabs lazy @tab-click="handleTabClick" v-model="currentType">
    <el-tab-pane
      v-for="category in groupActions"
      :key="category.category"
      :label="$t('title.' + category.category)"
      :name="category.category"
    >
      <TreeTGroupActions
        v-if="category.category === currentType"
        :data="category"
      />
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
      category: 'client-group',
      actions: {
        maingroups: ['group-add'],
        parent: ['edit', 'delete', 'client-delete', 'client-add', 'group-add'],
        children: ['delete', 'copy'],
      },
    },
    {
      category: 'product-group',
      actions: {
        parent: ['delete', 'product-delete', 'product-add'],
        children: ['delete'],
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
    },
  )

  onMounted(() => {
    if (router.currentRoute.value.path !== `/groups/${currentType.value}`) {
      router.push({ path: `/groups/${currentType.value}` })
    }
  })
</script>
