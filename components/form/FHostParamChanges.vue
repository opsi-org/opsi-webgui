<template>
  <div>
    <InputIFilterTChanges v-if="changes" :filter.sync="filter" />
    <span v-for="item in changes" :key="item.configId+item.value" :class="{ 'd-none': !item.configId.includes(filter) && !item.hostId.includes(filter) }">
      <GridGFormItem value-more="true">
        <template #label>
          <span :class="{'font-weight-bold': item.type=='depots'}"> {{ item.hostId }} </span>
        </template>
        <template #value>
          {{ $t('{') }} {{ item.configId }} {{ $t(':') }} {{ item.value }} {{ $t('}') }}
        </template>
        <template #valueMore>
          <ButtonBTNDeleteObj :item="item" from="hostparam" />
        </template>
      </GridGFormItem>
    </span>
    <!-- {{ changes }} -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class FHostParamChanges extends Vue {
  @Prop({ }) changes!: any
  filter: string = ''
}
</script>
