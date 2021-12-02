<template>
  <div :id="`TCBadgeCompares_${type}_hover_${rowid}`">
    <TableCellTCInstallationStatus v-if="type=='installationStatus' && text=='mixed'" :text="text" />
    <TableCellTCInstallationStatus v-else-if="type=='installationStatus'" :text="text" />

    <TableCellTCActionResult v-else-if="type=='actionResult' && text=='mixed'" :text="text" />
    <TableCellTCActionResult v-else-if="type=='actionResult'" :text="text" />

    <b-badge v-else>
      {{ text }}
    </b-badge>
    <TooltipTTProductCell
      v-if="text=='mixed' && tooltiptext"
      :target="`TCBadgeCompares_${type}_hover_${rowid}`"
      :details="tooltiptext"
      :type="type"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { mapValues2Value, mapValues2Objects } from 'uib-components/.utils/utils/smappings'
import { IObjectString2String } from 'uib-components/.utils/types/tgeneral'

@Component
export default class TCSpan extends Vue {
  @Prop({ }) rowid!: string
  @Prop({ }) type!: string
  @Prop({ }) values!: Array<string>
  @Prop({ }) objects!: Array<string>
  @Prop({ }) objectsorigin!: Array<string>
  defaults: IObjectString2String = {
    actionResult: 'none',
    installationStatus: 'not_installed'
  }

  get text () {
    return mapValues2Value(this.values, this.objects, this.objectsorigin, this.defaults[this.type])
  }

  get tooltiptext () {
    return mapValues2Objects(this.values, this.objects, this.objectsorigin, this.defaults[this.type])
  }
}
</script>
