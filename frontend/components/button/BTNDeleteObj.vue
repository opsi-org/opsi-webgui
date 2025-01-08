<template>
  <el-button
    data-testid="ButtonBTNDeleteObj"
    class="border-0"
    variant="outline-primary"
    size="small"
    :title="$t('button.reset')"
    @click="deleteChanges()"
  >
    <span class="sr-only">{{ $t('button.reset') }}</span>
    <IconIIcon :icon="icons.reset" />
  </el-button>
</template>

<script lang="ts" setup>
  const $t = useI18n().t
  const icons = useIcons()
  const changes = storeChanges()

  const props = defineProps({
    item: { type: Object, required: true },
    from: { type: String, required: true },
  })

  function deleteChanges() {
    if (!props.item) return

    if (props.from === 'products') {
      changes.delFromChangesProducts(props.item)
    }
    if (props.from === 'hostparam') {
      changes.delFromChangesHostParam(props.item)
    }
  }
</script>
