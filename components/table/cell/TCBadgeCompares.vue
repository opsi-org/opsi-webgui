<template>
  <div :id="`TCBadgeCompares_${type}_hover_${rowid}`" class="TCBadgeCompares" data-testid="TCBadgeCompares">
    <TableCellTCInstallationStatus v-if="type=='installationStatus' && text=='mixed'" :text="text" :variant="variant" />
    <TableCellTCInstallationStatus v-else-if="type=='installationStatus'" :text="text" :variant="variant" />

    <TableCellTCActionResult v-else-if="type=='actionResult' && text=='mixed'" :text="text" :variant="variant" />
    <TableCellTCActionResult v-else-if="type=='actionResult'" :text="text" :variant="variant" />

    <b-badge v-else>
      {{ text }}
    </b-badge>
    <TooltipTTProductCell
      :target="`TCBadgeCompares_${type}_hover_${rowid}`"
      :details="tooltiptext"
      :type="type"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { mapValues2Value, mapValues2Objects } from '../../../.utils/utils/smappings'
import { IObjectString2String } from '../../../.utils/types/tgeneral'

@Component
export default class TCBadgeCompares extends Vue {
  @Prop({ }) rowid!: string
  @Prop({ }) type!: string
  @Prop({ }) values!: Array<string>
  @Prop({ }) objects!: Array<string>
  @Prop({ }) objectsorigin!: Array<string>
  defaults: IObjectString2String = {
    actionResult: 'none',
    installationStatus: 'not_installed'
  }

  get variant () {
    // if (this.values.some(v => v === 'failed' || v === 'unknown')) {
    if (this.values.includes('failed')) {
      return 'danger'
    }
    if (this.values.every(v => v === '' || v === 'None' || v === 'none' || v === 'not_installed' || v === 'successful' || v === 'installed')) {
      return 'success'
    }
    return 'warning'
  }

  get text () {
    return mapValues2Value(this.values, this.objects, this.objectsorigin, this.defaults[this.type])
  }

  get tooltiptext () {
    return mapValues2Objects(this.values, this.objects, this.objectsorigin, this.defaults[this.type])
  }
}
</script>
