<template>
  <div>
    <p v-if="simple" class="ml-2">{{ id }} <br /></p>
    <el-card v-else body-class="p-1 pt-3" shadow="always">
      <ul>
        <li>{{ id }}</li>
      </ul>
    </el-card>
    <el-card
      v-if="withAllSelectedDisabled"
      body-class="p-1 pt-3 max-h-64 overflow-y-auto"
      shadow="always"
    >
      <p style="color: var(--el-text-color-disabled)">
        {{ $t('button.event.ondemand.notincluded') }}
      </p>
      <p
        v-for="c in selection.toSorted()"
        :key="c"
        style="color: var(--el-text-color-disabled)"
        class="ml-4"
      >
        {{ c }}
      </p>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
  const $t = useI18n().t
  const _props = defineProps({
    id: { type: String, default: '' },
    selection: { type: Array as PropType<Array<string>>, default: () => [] },
    withAllSelectedDisabled: { type: Boolean, default: false },
    simple: { type: Boolean, default: false },
  })
</script>
