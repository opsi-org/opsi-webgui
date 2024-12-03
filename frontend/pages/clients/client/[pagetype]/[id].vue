<template>
  <div>
    <el-text tag="b" class="text-capitalize"> {{ pagetype }}</el-text> -
    <el-text tag="i"> {{ id }} </el-text>
    <el-button class="float-right" @click="router.push('/clients/')"
      >X</el-button
    >
    <ViewVConfig
      v-if="pagetype === 'config'"
      :type="type"
      :id="id"
      :is-child="id !== undefined && id !== ''"
    />
    <ViewVClientsLog
      v-else-if="pagetype === 'logs'"
      :type="type"
      :id="id"
      :is-child="id !== undefined && id !== ''"
    />
    <FormFCloneClient
      v-else-if="pagetype === 'clone'"
      :id="id"
      :is-child="id !== undefined && id !== ''"
    />
    <div v-else>Page not found!</div>
  </div>
</template>

<script setup lang="ts">
  import { usePageHelper } from '~/composables/mixins/usePageHelper'
  import type { PropTypeServerClient } from '~/types/tproptypes'
  const route = useRoute()
  const router = useRouter()
  const type = computed(
    () => usePageHelper().path.value[0] as PropTypeServerClient,
  )
  const id = computed(() => route.params.id as string)
  const pagetype = computed(() => route.params.pagetype as string)
</script>
