<template>
  <div data-testid="TCInstallationStatus">
    <el-tag v-if="props.text=='mixed'" data-testid="TCInstallationStatusBadge"  :type="props.variant">
      <IconIIcon :icon="icons.unequal" alt="mixed" :title="props.text" />
    </el-tag>
    <el-tag v-else-if="props.text=='installed'" data-testid="TCInstallationStatusBadge"  type="success">
      <span class="h6">
        <IconIIcon :icon="icons.client" alt="installed" :title="props.text" />
      </span>
    </el-tag>
    <el-tag v-else-if="props.text=='unknown'" data-testid="TCInstallationStatusBadge"  type="warning">
      <span class="h6">
        <IconIIcon :icon="icons.productInstallationStatusUnknown" :alt="props.text" />
      </span>
    </el-tag>
    <el-tag v-else-if="$mq=='mobile'&&(props.text=='not_installed'||props.text==''||props.text=='none')" data-testid="TCInstallationStatusBadge" :type="undefined"> <!-- transparent-->
      <span class="h6"> {{ ($mq=='mobile')? t_fixed('keep-english.empty'):'' }} </span>
    </el-tag>
    <div v-else-if="$mq!='mobile'&&(props.text=='not_installed'||props.text==''||props.text=='none')" data-testid="TCInstallationStatusBadge" :type="undefined" > <!-- transparent -->
    </div>
    <el-tag v-else data-testid="TCInstallationStatusBadge" :type="props.variant">
      <!-- mixed -->
      <span class="h6"> {{ props.text }} </span>

    </el-tag>
    <div v-else>{{  props.text }}</div>
    <!-- <b-badge v-if="props.text=='mixed'" data-testid="TCInstallationStatusBadge" :variant="props.variant">
      <span class="h6"> {{ t_fixed('unequal') }} </span>
    </b-badge> -->
    <!-- <b-badge v-else-if="props.text=='installed'" data-testid="TCInstallationStatusBadge" variant="success">
      <span class="h6">
        <IconIIcon :icon="icons.client" alt="installed" :title="props.text" />
      </span>
    </b-badge> -->
    <!-- <b-badge v-else-if="props.text=='unknown'" data-testid="TCInstallationStatusBadge" variant="warning" text-variant="dark">
      <span class="h6">
        <IconIIcon :icon="icons.productInstallationStatusUnknown" :alt="props.text" />
      </span>
    </b-badge> -->
    <!-- <b-badge v-else-if="$mq=='mobile'&&(props.text=='not_installed'||props.text==''||props.text=='none')" data-testid="TCInstallationStatusBadge" variant="transparent">
      <span class="h6"> {{ ($mq=='mobile')? t_fixed('keep-english.empty'):'' }} </span>
    </b-badge> -->
    <!-- <b-badge v-else-if="$mq!='mobile'&&(props.text=='not_installed'||props.text==''||props.text=='none')" data-testid="TCInstallationStatusBadge" variant="transparent" />
      <b-badge v-else data-testid="TCInstallationStatusBadge" :variant="props.variant">
        <span class="h6"> {{ props.text }} </span>
      </b-badge> -->
  </div>
</template>

<script lang="ts" setup>
import { useIcons } from '~/composables/mixins/useIcons';
import { useStrings } from '~/composables/mixins/useStrings';
import type { ElTypeVariant } from '~/types/LibComponentTypes';


// import { Component, Prop, Vue } from 'nuxt-property-decorator'
// import { Icons } from '../../../mixins/icons'
// // eslint-disable-next-line import/namespace
// import { Strings } from '../../../mixins/strings'
const icons = useIcons()
const { t_fixed } = useStrings()
const $mq = useMQ().$mq
// @Component({ mixins: [Icons, Strings] })
// export default class TCInstallationStatus extends Vue {
//   icon: any // from mixin
//   $mq:any
//   t_fixed: any

const props = defineProps({
  text: { type: String, default: '' },
  variant: { type: String as PropType<ElTypeVariant>, default: 'warning' }
})
//   @Prop({ }) text!: string
//   @Prop({ default: 'warning' }) variant!: string
// }
</script>
