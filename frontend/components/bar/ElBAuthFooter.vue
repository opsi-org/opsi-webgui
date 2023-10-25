<template>

    <!--
      <el-header>Header</el-header>
      <el-main>Main</el-main> -->
      <el-footer>
        <span class="text-small">{{ staticStrings.t_fixed('uib') }}</span>
        <DropdownDDLang :footer="true" />
        <!-- <TestTheme /> -->
        <span class="text-small BAuthFooter-version">
          {{ $t('label.version') }} {{ $config.packageVersion }}
        </span>

        <el-dropdown class="m-4" type="primary">
          <el-button type="primary" plain>
            Dropdown List<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>Action 1</el-dropdown-item>
              <el-dropdown-item>Action 2</el-dropdown-item>
              <el-dropdown-item>Action 3</el-dropdown-item>
              <el-dropdown-item>Action 4</el-dropdown-item>
              <el-dropdown-item>Action 5</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <button>button hello</button>
        <button class="">button class? hello</button>
        <b-button>bbutton hello</b-button>
        <el-button>elbutton with outline (default)</el-button>
        <el-button :style="'outline: none'">Elbutton none outline (style)</el-button>
        <el-button class="">elbutton with class</el-button>
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