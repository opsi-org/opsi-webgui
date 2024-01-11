<template>
  <div data-testid="IDetails" :class="'IDetails ' + content">
    <el-tag :type="props.variant" size="small">
    <!-- <b-badge
      v-bind="$props"
      data-testid="IDetailsBadge"
      :variant="props.variant"
      size="sm"
    > -->
      <span v-if="props.content=='depot-unequal'" class="inline">
        {{ props.text ? props.text: t_fixed('unequal') }}
        <IconIIcon :icon="icons.server" size="small"/>
      </span>
      <span v-else-if="props.content=='depot-wo-prod'" class="h6">
        {{ $t('notOrigin') }} <IconIIcon :icon="icons.server" />
      </span>
      <span v-else-if="props.content=='client-outdated'" class="h6">
        <span> {{ props.text ? props.text: t_fixed('unequal') }}</span> <IconIIcon :icon="icons.client" />
      </span>
      <span v-else-if="props.content=='ppv-client-different'" class="h6">
        <span> {{ props.text ? props.text: t_fixed('unequal') }}</span> <IconIIcon :icon="icons.client" />
      </span>
      <span v-else-if="props.content=='ppid-not-exists-on-depot'" class="h6">
        {{ t_fixed('unequal') }} <IconIIcon :icon="icons.server" />
      </span>
      <span v-else class="h6">{{ props.content==='unequal'? t_fixed('unequal'):props.content }} </span>
    <!-- </b-badge> -->
  </el-tag>

  </div>
</template>

<script setup lang="ts">
import type { BaseColorVariant } from 'bootstrap-vue-next/dist/src/types';
import type { EpPropMergeType } from 'element-plus/es/utils';
import { useIcons } from '~/composables/mixins/useIcons';
import { useStrings } from '~/composables/mixins/useStrings';
type ElType = EpPropMergeType<StringConstructor, "" | "warning" | "success" | "info" | "danger", unknown> | undefined

const props = defineProps({
  text: { type: String, default: '' },
  content: { type: String, default: '*' },
  // variant: { type: String, default: 'warning' }
  variant: { type: Object as PropType<ElType>, default: 'warning' }
})

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
