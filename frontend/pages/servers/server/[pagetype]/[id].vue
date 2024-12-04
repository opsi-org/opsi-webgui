<template>
  <div>
    <el-text tag="b" class="text-capitalize"> {{ pagetype }}</el-text> -
    <el-text tag="i"> {{ id }} </el-text>
    <el-button
      class="float-right"
      @click="
        () => {
          splitviewVisibilityServertable = true
          router.push(`/${type}/`)
        }
      "
      ><IconIIcon :icon="icons.x"
    /></el-button>
    <ViewVConfig
      v-if="pagetype === 'config'"
      :type="type"
      :id="id"
      :is-child="id !== undefined && id !== ''"
    />
    <div v-else>Page not found!</div>
  </div>
</template>

<script setup lang="ts">
  import { useIcons } from '~/composables/mixins/useIcons'
  import { usePageHelper } from '~/composables/mixins/usePageHelper'
  import type { PropTypeServerClient } from '~/types/tproptypes'
  const route = useRoute()
  const router = useRouter()
  const icons = useIcons()
  const { splitviewVisibilityServertable } = storeToRefs(
    storeInternalSettings(),
  )
  const type = computed<PropTypeServerClient>(
    () => usePageHelper().path.value[0] as PropTypeServerClient,
  )
  const id = computed<string>(() => route.params.id as string)
  const pagetype = computed<string>(() => route.params.pagetype as string)
</script>
