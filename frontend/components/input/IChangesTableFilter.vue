<template>
  <div data-testid="IChangesTableFilter">
    <el-input
      v-model="modelFilter"
      :aria-label="placeholder"
      :placeholder="placeholder"
    >
      <template #prefix>
        <IconIIcon :icon="icons.filter" />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '~/composables/mixins/useIcons';
const icons = useIcons()
const modelFilter = defineModel<string>()
const _props = defineProps<{
  placeholder: string
}>()
</script>
<!-- <script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class IFilterTChanges extends Vue {
  @Prop({ }) placeholder!: string
  filter: string = ''
} -->