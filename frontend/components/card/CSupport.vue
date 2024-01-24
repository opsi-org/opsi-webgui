<template>
  <div data-testid="CSupport"
      class="h-full min-h-full"
      >
    <!-- :class="{smallcard: $mq=='mobile', normalcard: $mq=='desktop'}" -->
    <el-card
      shadow="never"
      body-class="border-0 m-1 max-h-50 max-w-full h-full min-hfull"
      style="--el-card-padding: 10px;"
      class="h-full min-h-full"
      >
      <template #header>
        <h5>{{ $t(item.title) }}  <br /></h5>
      </template>

      <p :class="{smallText: $mq=='mobile', normalText: $mq=='desktop'}">
        {{ $t(item.description) }}
      </p>
      <el-link type="primary" :href="item.link" target="_blank">{{ $t(item.buttonname) }}</el-link>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// import { Component, Prop, Vue } from 'nuxt-property-decorator'
// const $t = useI18n().t
// @Component
// export default class CSupport extends Vue {
  // @Prop({ }) item!: any
  const props = defineProps({
    item: { type: Object, required: true }
  })
  // $mq: any
  const $mq = useMQ().$mq
// }
</script>
<style scoped>

.el-card__header {
  font-weight: bold;
  font-size: 11px;
}
.el-card__body {
  font-weight: bold;
  font-size: 14px;
}
</style>
