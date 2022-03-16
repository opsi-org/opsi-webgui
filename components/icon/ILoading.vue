<template>
  <div class="container-fluid" data-testid="ILoading">
    {{ $t('message.loading') }}
    <b-icon :icon="iconnames.loading" animation="cylon" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class ILoading extends Vue {
  iconnames: any
}
</script>
