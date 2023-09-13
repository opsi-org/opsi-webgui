<template>
  <div data-testid="VServerHealthCheck">
    <b-tabs small lazy>
      <b-tab :title="$t('title.healthcheck')" active>
        <ViewVHealthCheck />
      </b-tab>
      <b-tab :title="$t('title.diagnostics')">
        <ViewVDiagnostics />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
@Component({ mixins: [Icons] })
export default class VHealthCheck extends Vue {
}
</script>
