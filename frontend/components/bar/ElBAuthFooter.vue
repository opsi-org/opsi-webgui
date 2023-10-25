<template>
      <el-footer class="bg-secondary p-0 max-h-10">
        <el-row class="row-bg bg-primary ml-0 h-100 pl-2 pr-2" justify="space-between">
          <el-col :span="3" class="flex items-stretch">
            <el-text class="text-xs">{{ staticStrings.t_fixed('uib') }}</el-text>
          </el-col>
          <el-col :span="3" class="flex justify-center">
            <DropdownDDLang :footer="true" />
          </el-col>
          <el-col :span="4" class="flex justify-end space-x-1">
            <el-text class="text-xs">{{ $t('label.version') }}</el-text>
            <el-text class="text-xs">{{ $config.public.packageVersion }}</el-text>
          </el-col>
        </el-row>
      </el-footer>
  <!-- </div>
  <div class="fixed-bottom"> -->
    <!-- <b-navbar
      toggleable="md"
      fixed="bottom"
      data-testid="BarBAuthFooter"
      variant="primary"
      :class="{auth_footer: mq.$mq !== 'mobile', auth_footer_wrap: mq.$mq === 'mobile'}"
    >
      <b-container fluid>
      </b-container>
    </b-navbar> -->
  <!-- </div> -->
</template>

<script setup>
import { useStrings } from "../../composables/mixins/useStrings"
const staticStrings = useStrings()
const $config = useRuntimeConfig()
const mq = useMQ()

</script>
<style scoped>

/* .auth_footer{
  height: 50px !important;
}
.auth_footer > div{
  margin-left: 20px;
  margin-right: 20px;
}
.auth_footer_wrap {
  display: flex;
  flex-wrap: wrap;
} */
</style>