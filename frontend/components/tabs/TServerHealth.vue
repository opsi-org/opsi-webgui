<template>
  <el-tabs>
    <el-tab-pane :label="$t('title.healthcheck')">
      {{ $t('title.healthcheck') }}
    </el-tab-pane>
    <el-tab-pane :label="$t('title.diagnostics')">
      {{ $t('title.diagnostics') }}
    </el-tab-pane>
  </el-tabs>
  <!-- <div data-testid="TServerHealth">
    <b-tabs small lazy>
      <b-tab :title="$t('title.healthcheck')" active>
        <ViewVHealthCheck />
      </b-tab>
      <b-tab :title="$t('title.diagnostics')">
        <ViewVDiagnostics />
      </b-tab>
    </b-tabs>
  </div> -->
</template>

<script setup lang="ts">
// import { Component, Vue } from 'nuxt-property-decorator'
// import { Icons } from '../../mixins/icons'
// @Component({ mixins: [Icons] })
// export default class TServerHealth extends Vue {
// }
</script>
