<template>
  <b-row data-testid="GFormItem" :class="formclass" class="GFormItem p-0 pt-1">
    <b-col
      :sm="newRowForValueWrapper ? undefined : (variant === 'longlabel' ? 5 : (variant === 'longvalue' ? 3 : 2))"
      class="d-inline pl-4 text-sm-left"
      :class="{ [labelclass]: true,
                'firstcol': !newRowForValueWrapper,
                'w-100': newRowForValueWrapper,
                'text-small': !newRowForValueWrapper }"
    >
      <slot name="label" />
      {{ label }}
    </b-col>
    <div v-if="newRowForValueWrapper" class="w-100" />
    <b-col
      class="text-sm-left text-small valcol"
      :class="{'mobile-leftspace': newRowForValueWrapper,
               'mt-1': (formclass.includes('collapsable'))}"
      :sm="variant === 'longlabel' || $mq=='mobile' || variant==='longvalue' ? '' : 3"
    >
      <slot name="value" />
      {{ value? value:'' }}
    </b-col>
    <div v-if="newRowForValueWrapper" class="w-100" />
    <b-col
      v-if="valueMore"
      class="text-sm-left text-small morevalcol"
      :class="{'mobile-leftspace': newRowForValueWrapper,
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
  $mq!: string

  @Prop({ }) label?: string
  @Prop({ default: '' }) labelclass?: string
  @Prop({ }) value?: string
  @Prop({ }) valueMore?: boolean
  @Prop({ }) valuedetails?: string
  @Prop({ default: undefined }) newRowForValue?: boolean
  @Prop({ default: 'longlabel' }) variant?: string // shortlabel
  @Prop({ default: 'mb-2 container' }) formclass?: any

  get newRowForValueWrapper () {
    return this.newRowForValue || this.$mq === 'mobile'
  }
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
