<template>
  <div data-testid="CChangeLogs">
    <b-card :title="$t('title.whatsnew')"
    class="text-center bg-primary mt-3 mx-auto"
    :style="$mq === 'mobile'? 'width:100%;' : 'width:50%;max-width:400px;' "
    >
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class CChangeLogs extends Vue {

}
</script>
<style>
</style>
