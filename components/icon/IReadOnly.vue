<template>
  <!-- v-if="config && config.read_only" -->
  <div
    v-if="readonly"
    data-testid="IReadOnly"
    :title="$t('label.readonly')"
    class="IReadOnly container-fluid"
  >
    <b-iconstack font-scale="1.5">
      <b-icon
        v-for="el in iconnames._stackedIcons.readonly"
        :key="el.icon"
        stacked
        :icon="el.icon"
        :scale="el.scale || '1'"
        v-bind="el.attr"
      />
    </b-iconstack>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
// import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Constants } from '../../mixins/uib-mixins'
const config = namespace('config-app')

@Component({ mixins: [Constants] })
export default class ILoading extends Vue {
  iconnames: any

  // @config.Getter public config!: IObjectString2Boolean
  @config.Getter public readonly!: Boolean
}
</script>

<style>
.IReadOnly .text-danger {
  color: var(--danger) !important;
}
</style>
