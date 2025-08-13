<template>
  <el-scrollbar max-height="70vh" class="w-full items-stretch flex ml-3">
    <p-panel class="!p-0" style="--p-panel-header-padding: 0px">
      <ul direction="vertical">
        <li v-for="item in props.data" :key="item" class="relative flex items-stretch">
          <p class="pr-8">{{ item }}</p>
          <el-button
            v-if="emitDeleteExists"
            size="small"
            class="!border-none !p-1 absolute top-0 right-0"
            :title="$t('deselectItem', { item: item })"
          >
            <span class="sr-only">{{ $t('deselect') }}</span>
            <IconIIcon :icon="icons.x" @click="emit('delete')" />
          </el-button>
        </li>
      </ul>
    </p-panel>
  </el-scrollbar>
</template>

<script setup lang="ts">
  const thisInstance = getCurrentInstance()
  const icons = useIcons()
  const emit = defineEmits(['delete'])
  const props = defineProps({
    data: {
      type: Object,
      required: true,
    },
  })

  const emitDeleteExists = computed(() => {
    return (
      thisInstance?.vnode?.props?.delete !== undefined ||
      thisInstance?.vnode?.props?.onDelete !== undefined
    )
  })
</script>
