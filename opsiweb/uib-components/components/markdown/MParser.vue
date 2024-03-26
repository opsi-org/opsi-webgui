<template>
  <vue-markdown>{{ content }} </vue-markdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
@Component
export default class MParser extends Vue {
@Prop({ }) content!: any
}
</script>
