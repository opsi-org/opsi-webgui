<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <div
      :id="`TCBadgeCompares_${type}_hover_${rowid}`"
      class="TCBadgeCompares"
      data-testid="TCBadgeCompares"
    >
      <TooltipTTooltip>
        <template #tooltip>
          <TooltipCell />
        </template>
        <TablecellTCProductInstallationStatus
          v-if="type == 'installationStatus' && gettext == MIXED"
          :text="gettext"
          :variant="getvariant"
        />
        <TablecellTCProductInstallationStatus
          v-else-if="type == 'installationStatus'"
          :text="gettext"
          :variant="getvariant"
        />

        <TablecellTCProductActionResult
          v-else-if="type == 'actionResult' && gettext == MIXED"
          :text="gettext"
          :variant="getvariant"
        />
        <TablecellTCProductActionResult
          v-else-if="type == 'actionResult'"
          :text="gettext"
          :variant="getvariant"
        />
        <el-tag v-else>
          <el-text>{{ gettext }}</el-text>
        </el-tag>
      </TooltipTTooltip>
    </div>
    <!--<PPopover ref="op"> <TooltipCell /> </PPopover>-->
  </div>
</template>

<script lang="tsx" setup>
  import type { PSeverity } from '~/types/LibComponentTypes'
  import type { IObjectString2String } from '~/types/tgeneral'
  const $t = useI18n().t

  const MIXED = $t('mixed')

  const props = defineProps({
    rowid: { type: String, default: '' },
    type: { type: String, default: '' },
    values: { type: Array<string>, default: () => [] },
    objects: { type: Array<string>, default: () => [] },
    objectsorigin: { type: Array<string>, default: () => [] },
  })
  const defaults: IObjectString2String = {
    actionResult: 'none',
    installationStatus: 'not_installed',
  }
  const getvariant = computed<PSeverity>(() => {
    if (props.values?.includes('failed')) {
      return 'danger'
    }
    if (
      props.values?.every(
        (v) =>
          v === '' ||
          v === 'None' ||
          v === 'none' ||
          v === 'not_installed' ||
          v === 'successful' ||
          v === 'installed'
      )
    ) {
      return 'success'
    }
    return 'warn'
  })

  const gettext = computed<string>(() => {
    return mapValues2Value(props.values, props.objects, props.objectsorigin, defaults[props.type], {
      none: 'none',
      mixed: MIXED,
    })
  })

  const gettooltipobj = computed(() => {
    return mapValues2Objects(props.values, props.objects, props.objectsorigin, defaults[props.type])
  })

  function _getVariantInTooltip(v: string): PSeverity {
    if (v === 'failed') {
      return 'danger'
    }
    if (v === '' || v === 'None' || v === 'none' || v === 'not_installed') return 'secondary' // gray

    if (v === 'successful' || v === 'installed') {
      return 'success'
    }
    return 'warn'
  }
  const TooltipCell = () => {
    const items: any[] = []
    for (const [key, value] of Object.entries(gettooltipobj.value)) {
      items.push(
        <tr>
          <td>{key}</td>
          <td>
            <p-tag severity={_getVariantInTooltip(value)}>{value}</p-tag>
          </td>
        </tr>
      )
    }
    return (
      <>
        <h6>{props.type}</h6>
        <table class="auto-table">
          <tbody> {items} </tbody>
        </table>
      </>
    )
  }
</script>
