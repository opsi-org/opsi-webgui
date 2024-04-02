<template>
  <div data-testid="TCActionResult">
    <el-tag v-if="props.text=='mixed'" data-testid="TCActionResultBadge" :type="props.variant">
      <!-- <span class="h6"> {{ t_fixed('unequal') }} </span> -->
      <IconIIcon :icon="icon.unequal" alt="mixed" :title="props.text" />
    </el-tag>
    <el-tag v-else-if="props.text=='successful'" data-testid="TCActionResultBadge" type="success">
      <span class="h6"> <IconIIcon :icon="icon.productActionResultSuccessful" alt="successful" /> </span>
    </el-tag>
    <el-tag v-else-if="props.text=='failed'" data-testid="TCActionResultBadge" type="danger">
      <span class="h6"> <IconIIcon :icon="icon.x" alt="failed" /> </span>
    </el-tag>
    <div v-else-if="$mq=='mobile'&&(props.text=='not_installed'||props.text==''||props.text=='none')" data-testid="TCActionResultBadge" type="">
      <span class="h6"> {{ ($mq=='mobile')? t_fixed('keep-english.empty') : '' }} </span>
    </div>
    <div v-else-if="$mq!='mobile'&&(props.text=='not_installed'||props.text==''||props.text=='none')" data-testid="TCActionResultBadge" type="" />
    <el-tag v-else data-testid="TCActionResultBadge" :type="props.variant">
      <span class="h6"> {{ props.text }} </span>
    </el-tag>
  </div>
</template>

<script lang="ts" setup>
import { useStrings } from '~/composables/mixins/useStrings';
import { useIcons } from '../../composables/mixins/useIcons';
import type { ElTypeVariant } from '~/types/LibComponentTypes';

// import { Component, Prop, Vue } from 'nuxt-property-decorator'
// import { Icons } from '../../../mixins/icons'
// import { Strings } from '../../../mixins/strings'
const icon = useIcons()
const t_fixed = useStrings().t_fixed
const mq = useMQ().$mq
// @Component({ mixins: [Icons, Strings] })
// export default class TCActionResult extends Vue {
  // $mq: any
  // icon: any
  // t_fixed: any

// type ElType = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'transparent' | undefined

const props = defineProps({
  text: { type: String, default: '' },
  variant: { type: Object as PropType<ElTypeVariant>, default: 'warning' }
})
//   @Prop({ }) text!: string
//   @Prop({ default: 'warning' }) variant!: string
// }
</script>
