<template>
  <div data-testid="TSDepotsNotStored">
    <treeselect
      v-if="depotIds"
      id="tooltip-target-1"
      v-model="idselection"
      :class="cssclass"
      class="treeselect_notstored treeselect"
      :options="depotIds"
      :clearable="emptyAllowed"
      :placeholder="$t('form.depot')"
      :always-open="false"
      @input="$emit('update:id', idselection)"
    />
    <b-tooltip target="tooltip-target-1" triggers="hover-right" >
      {{ emptyAllowed ? tooltipEmptyAllowed : '' }}
    </b-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Depot } from '../../mixins/get'
const selections = namespace('selections')

@Component({ mixins: [Depot] })
export default class TSDepotsNotStored extends Vue {
  $axios: any
  getDepotIdList:any
  @Prop({ }) cssclass!: string
  @Prop({ default: '' }) tooltipEmptyAllowed!: string
  @Prop({ default: false }) emptyAllowed!: boolean

  depotIds: Array<object> = []
  idselection: string = ''
  @selections.Getter public selectionDepots!: Array<string>

  async fetch () {
    const depots: Array<object> = []
    const result = await this.getDepotIdList()
    result.sort()
    for (const d in result) {
      const depot = result[d]
      depots.push({ id: depot, label: depot })
    }
    this.depotIds = depots
    if (this.selectionDepots.length !== 0) {
      this.idselection = this.selectionDepots[0]
    }
    this.$emit('update:id', this.idselection)
  }
}
</script>
