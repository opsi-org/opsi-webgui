<template>
  <b-button
    data-testid="BTNClearSelection"
    :aria-label="$t('table.selection.clear')"
    :title="props.showLabel? '' : $t('table.selection.clear')"
    variant="outline-primary"
    class="ml-0 border-0"
    :class="props.short !== false ? '' : 'w-100'"
    size="sm"
    @click="click"
    >
    <!-- @click="clearselection" -->
    <span class="sr-only">{{ $t('table.selection.clear') }}</span>
    <IconIIcon :icon="icons.clear" />
    <span v-if="props.showLabel == true" class="clearButton">
      {{ props.label? props.label: $t('table.selection.clear') }}
    </span>
  </b-button>
</template>

<script setup lang="ts">
// import { Component, Prop, Vue } from 'nuxt-property-decorator'

import type { PropType } from 'vue';
import { useIcons } from '~/composables/mixins/useIcons';

// import { Icons } from '../../mixins/icons'
const icons = useIcons()

// @Component({ mixins: [Icons] })
// export default class BTNClearSelection extends Vue {
  // icon:any
  // @Prop({}) label?: string
  // @Prop({ default: true }) showLabel?: boolean
  // @Prop({ default: false }) short?: boolean
  // @Prop({ default: () => { return () => { /* default */ } } }) clearselection!: Function
// }
// const click = (value: MouseEvent) : any => { console.log('hallo') }
const click = (e) => {
  $emit('clearselection')
}
const $emit = defineEmits(['clearselection'])
const props = defineProps({
  label: { type: String, default: '' },
  showLabel: { type: Boolean, default: false },
  short: { type: Boolean, default: true },
  // clearselection: { type: Object as PropType<typeof click>, default: (ev: MouseEvent) => {}}
})
</script>
