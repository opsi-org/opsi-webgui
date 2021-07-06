<template>
  <b-container fluid>
    <b-card>
      <b-row>
        <b-col md="7">
          <b-card-body :title="item.title">
            <b-card-text>
              {{ item.description }}
            </b-card-text>
          </b-card-body>
        </b-col>
        <b-col md="5">
          <b-card-body>
            <a class="btn btn-default border support-button" :href="item.link" target="_blank">{{ item.buttonname }}</a>
          </b-card-body>
        </b-col>
      </b-row>
    </b-card>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CSupport extends Vue {
  @Prop({ }) item!: object
}
</script>

<style>
.support-button {
    width: 230px !important;
}
</style>
