<template>
  <el-table
    :data="modelTransformed"
    :tree-props="{ children: 'children' }"
    ref="changestable"
    lazy
    style="width: 100%"
    row-key="productId"
    @row-click="expandRow"
  >
    <el-table-column prop="expand" width="50">
      <template #default="scope">
        <a
          v-if="scope.row.children"
          :aria-expanded="false"
          aria-controls="details-row-1"
          :aria-label="$t('button.expand.arialabel')"
          :title="$t('button.expand.arialabel')"
          @click="expandRow"
        >
          <IconIIcon v-if="scope.row.expanded" :icon="icons.arrowDown" />
          <IconIIcon v-else :icon="icons.arrowRight" />
        </a>
      </template>
    </el-table-column>
    <el-table-column prop="productId" />
    <el-table-column prop="clientId" />
    <el-table-column prop="actionRequest" />
    <el-table-column prop="save">
      <template #default="scope">
        <div v-if="!scope.row.children">
          <el-button
            @click="save(scope.row, false)"
            class="border-0"
            variant="outline-primary"
            size="small"
            :title="$t('button.save')"
          >
            <span class="sr-only">{{ $t('button.save') }}</span>
            <IconIIcon :icon="icons.check" />
          </el-button>
          <ButtonBTNDeleteObj
            v-if="!scope.row.children && modelValue"
            :item="scope.row"
            from="products"
          />
        </div>
      </template>
    </el-table-column>
    <!-- <el-table-column prop="remove" >
      <template #default="scope">
      </template>
    </el-table-column> -->
  </el-table>

  <el-scrollbar class="max-h-96 overflow-scroll rounded-lg p-2 shadow-sm">
    <pre class="m-0 text-sm">{{ modelTransformed }}</pre>
  </el-scrollbar>
</template>

<script setup lang="ts">
  import type { IObjectString2Any } from '~/types/tgeneral'
  import { useI18n } from 'vue-i18n'
  import { useIcons } from '~/composables/mixins/useIcons'
  import type { ChangeObj } from '~/types/tchanges'
  // const { notifyError } = useNotification();
  const icons = useIcons()
  const { t: $t } = useI18n()
  // const store = useStore();
  const changestable = ref()

  const modelValue = defineModel<Array<Record<string, any>>>()

  const modelTransformed = computed(() => {
    if (!modelValue.value) return []
    const key = 'productId'
    const groupedMap: IObjectString2Any = {}

    modelValue.value.forEach((item) => {
      const keyValue = item[key]
      if (!groupedMap[keyValue]) {
        groupedMap[keyValue] = { [key]: keyValue, children: [] }
      }
      groupedMap[keyValue].children.push(item)
    })
    return Object.values(groupedMap)
  })

  function expandRow(scope: any) {
    const row = Object.hasOwn(scope, 'row') ? scope.row : scope

    row.expanded = !row.expanded
    changestable.value.toggleRowExpansion(row, row.expanded)
    changestable.value.doLayout()
  }

  function save(rowItem: ChangeObj, saveAll: boolean) {
    console.warn(rowItem, 'saveall ', saveAll)
    // const change = rowItem
    // let showalert: any = true
    // if (saveAll) {
    //   showalert = false
    // }
    // if (change.actionRequest) {
    //   const data = {
    //     clientIds: [change.clientId],
    //     productIds: [change.productId],
    //     actionRequest: change.actionRequest
    //   }
    //   await this.saveProdActionRequest(data, change, showalert)
    // } else if (change.property) {
    //   const propObj: any = {}
    //   propObj[change.property] = change.propertyValue
    //   let propertychanges = {}
    //   if (change.clientId !== '') {
    //     propertychanges = {
    //       clientIds: [change.clientId],
    //       properties: propObj
    //     }
    //   } else {
    //     propertychanges = {
    //       depotIds: [change.depotId],
    //       properties: propObj
    //     }
    //   }
    //   await this.saveProdProperties(change.productId, propertychanges, change, showalert)
    // }
  }

  //   async saveAll () {
  //     const ref = (this.$refs.changesProductsAlert as any)
  //     const changelist = this.changesProducts.filter(o => o.user === this.username)
  //     const saveAll = true
  //     for (const p in changelist) {
  //       const change = changelist[p]
  //       await this.save(change, saveAll)
  //     }
  //     if (this.errorsProducts.length !== 0) {
  //       ref.alert(this.$t('message.error.title'), 'danger', this.errorsProducts)
  //       this.clearErrorsProducts()
  //     }
  //   }
  // }
</script>

<style scoped>
  :deep(.el-table__expand-icon) {
    display: none !important;
  }
</style>
