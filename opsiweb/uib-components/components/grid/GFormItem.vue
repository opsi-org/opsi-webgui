<template>
  <b-row data-testid="GFormItem" :class="formclass" class="GFormItem p-0 pt-1">
    <b-col :sm="variant === 'longlabel' ? 5 : (variant === 'longvalue' ? 3 : 2)" :class="'firstcol d-inline pl-4 text-small text-sm-left ' + labelclass">
      <slot name="label" />
      {{ label }}
    </b-col>
    <div v-if="($mq == 'mobile')" class="w-100" />
    <b-col
      class="text-sm-left text-small valcol"
      :class="{'mobile-leftspace': ($mq == 'mobile'),
               'mt-1': (formclass.includes('collapsable'))}"
      :sm="variant === 'longlabel' || $mq=='mobile' || variant==='longvalue' ? '' : 3"
    >
      <slot name="value" />
      {{ value? value:'' }}
    </b-col>
    <div v-if="($mq == 'mobile')" class="w-100" />
    <b-col
      v-if="valueMore"
      class="text-sm-left text-small morevalcol"
      :class="{'mobile-leftspace': ($mq == 'mobile'),
               'mt-1': (formclass.includes('collapsable'))}"
    >
    <!-- :sm="$mq=='mobile' ? '' : 3" -->
      <slot name="valueMore" />
      {{ valuedetails }}
      <!-- {{ valuedetails?.startsWith('No issues found')? '': valuedetails}} -->
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class GFormItem extends Vue {
  $mq: any
  @Prop({ }) label?: string
  @Prop({ }) labelclass?: string
  @Prop({ }) value?: string
  @Prop({ }) valueMore?: boolean
  @Prop({ }) valuedetails?: string
  @Prop({ default: 'longlabel' }) variant?: string // shortlabel
  @Prop({ default: 'mb-2 container' }) formclass?: any
}
</script>

<style>
.GFormItem {
  max-width: 99%;
  min-width: 99%;
}
.GFormItem.mainitem {
  border-top: 1px solid var(--general-bg-weak);
}
.GFormItem .mobile-leftspace {
  margin-left: 50px;
}
.GFormItem .firstcol {
  /* min-width: max-content; */
  min-width: 50px;
  word-wrap: revert;
  overflow-wrap: break-word;
}
</style>
