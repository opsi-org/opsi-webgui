<template>
  <div data-testid="IDetails" :class="'IDetails ' + content" class="inline">
    <el-tag :type="props.variant" size="small">
    <!-- <b-badge
      v-bind="$props"
      data-testid="IDetailsBadge"
      :variant="props.variant"
      size="sm"
    > -->
      <span v-if="props.content=='depot-unequal'" class="inline">
        <el-text>{{ props.text ? props.text: t_fixed('unequal') }}</el-text>
        <IconIIcon :icon="icons.depots" size="small"  class="inline"/>
      </span>
      <span v-else-if="props.content=='depot-wo-prod'" class="h6">
        <el-text>{{ t_fixed('notOrigin') }} </el-text>
        <IconIIcon :icon="icons.depots" class="inline"/>
      </span>
      <span v-else-if="props.content=='client-outdated'" class="h6">
        <el-text>{{ props.text ? props.text: t_fixed('unequal') }}</el-text>
        <!-- <span> {{ props.text ? props.text: t_fixed('unequal') }}</span> -->
        <IconIIcon :icon="icons.client"  class="inline"/>
      </span>
      <span v-else-if="props.content=='ppv-client-different'" class="h6">
        <el-text>{{ props.text ? props.text: t_fixed('unequal') }}</el-text>
        <!-- <span> {{ props.text ? props.text: t_fixed('unequal') }}</span>  -->
        <IconIIcon :icon="icons.client" class="inline" />
      </span>
      <span v-else-if="props.content=='ppid-not-exists-on-depot'" class="h6">
        <el-text>{{ t_fixed('unequal') }} </el-text>
        <IconIIcon :icon="icons.depots"  class="inline"/>
      </span>
      <el-text v-else class="h6">{{ props.content==='unequal'? t_fixed('unequal'):props.content }} </el-text>
    <!-- </b-badge> -->
  </el-tag>

  </div>
</template>

<script setup lang="ts">
// import type { BaseColorVariant } from 'bootstrap-vue-next/dist/src/types';
// import type { EpPropMergeType } from 'element-plus/es/utils';
import { useIcons } from '~/composables/mixins/useIcons';
import { useStrings } from '~/composables/mixins/useStrings';
import type { ElTypeVariant } from '~/types/LibComponentTypes'

const props = defineProps({
  text: { type: String, default: '' },
  content: { type: String, default: '*' },
  variant: { type: String as PropType<ElTypeVariant>, default: 'warning' }
})

// const $t = useI18n().t
const icons = useIcons()
const { t_fixed } = useStrings()
/* import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { Strings } from '../../mixins/strings'

@Component({ mixins: [Icons, Strings] })
export default class IDetails extends Vue {
  icon:any
  t_fixed:any
  @Prop({ default: '' }) text?: string
  @Prop({ default: '*' }) content?: string
  @Prop({ default: 'warning' }) variant?: string
} */
</script>
