<template>
  <el-tooltip :type="type" placement="bottom-end">
    <template #content> <TooltipCell /> </template>

    <div
      :id="`TCBadgeCompares_${type}_hover_${rowid}`"
      class="TCBadgeCompares"
      data-testid="TCBadgeCompares"
    >
      <TablecellTCProductInstallationStatus
        v-if="type == 'installationStatus' && gettext == 'mixed'"
        :text="gettext"
        :variant="getvariant"
      />
      <TablecellTCProductInstallationStatus
        v-else-if="type == 'installationStatus'"
        :text="gettext"
        :variant="getvariant"
      />

      <TablecellTCProductActionResult
        v-else-if="type == 'actionResult' && gettext == 'mixed'"
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
    </div>
  </el-tooltip>
</template>

<script lang="tsx" setup>
  import type { ElTypeVariant } from '~/types/LibComponentTypes'
  import type { IObjectString2String } from '~/types/tgeneral'

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
  const getvariant = computed<ElTypeVariant>(() => {
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
          v === 'installed',
      )
    ) {
      return 'success'
    }
    return 'warning'
  })

  const gettext = computed<string>(() => {
    return mapValues2Value(
      props.values,
      props.objects,
      props.objectsorigin,
      defaults[props.type],
    )
  })

  const gettooltipobj = computed(() => {
    return mapValues2Objects(
      props.values,
      props.objects,
      props.objectsorigin,
      defaults[props.type],
    )
  })

  function _getVariantInTooltip(v: string): ElTypeVariant {
    if (v === 'failed') {
      return 'danger'
    }
    if (v === '' || v === 'None' || v === 'none' || v === 'not_installed')
      return undefined

    if (v === 'successful' || v === 'installed') {
      return 'success'
    }
    return 'warning'
  }
  const TooltipCell = () => {
    const items: any[] = []
    for (const [key, value] of Object.entries(gettooltipobj.value)) {
      items.push(
        <>
          <tr>
            <td>{key}</td>
            <td>
              <el-tag type={_getVariantInTooltip(value)} effect="dark">
                {value}
              </el-tag>
              {/* ({v}) */}
            </td>
          </tr>
        </>,
      )
    }
    return (
      // <li v-for={{i in selectedItems}}>
      <>
        <h6>{props.type}</h6>
        <table class="auto-table">
          <tbody> {items} </tbody>
        </table>
        {/* <pre>{JSON.stringify(rowData)}</pre> */}
      </>
    )
  }
</script>
