<template>
  <div data-testid="CardCSupport">
    <b-card :title="$t(item.title)" :class="{smallcard: $mq=='mobile', normalcard: $mq=='desktop'}">
      <b-row>
        <b-col md="8">
          <p :class="{smallText: $mq=='mobile', normalText: $mq=='desktop'}">
            {{ $t(item.description) }}
          </p>
        </b-col>
        <b-col md="4">
          <a class="btn btn-outline-primary btn-sm border" :class="{smallText: $mq=='mobile', normalText: $mq=='desktop'}" :href="item.link" target="_blank">{{ $t(item.buttonname) }}</a>
        </b-col>
      </b-row>
    </b-card>
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
.smallcard .card-title {
  font-weight: bold;
  font-size: 11px;
}
.smallText {
  font-size: 11px;
}
.normalcard .card-title {
  font-weight: bold;
  font-size: 14px;
}
.normalText {
  font-size: 13px;
}
</style>
