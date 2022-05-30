<template>
  <div data-testid="CardCSupport">
    <b-card :title="$t(item.title)">
      <b-row>
        <b-col v-if="$mq!='mobile'" md="8">
          <span class="carddescription"> {{ $t(item.description) }} </span>
        </b-col>
        <b-col md="4">
          <a class="btn btn-outline-primary border carddescription" :href="item.link" target="_blank">{{ $t(item.buttonname) }}</a>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CSupport extends Vue {
  @Prop({ }) item!: object
}
</script>
<style>
.carddescription {
  font-size: 14px;
}
</style>
