<template>
  <div>
    <template v-if="component === 'tree'">
      <b-button size="sm" variant="light" @click="clearSelected()">
        <b-icon icon="x" />
      </b-button>
    </template>
    <template v-else>
      <b-button size="sm" variant="outline-primary" @click="clearSelected()">
        Clear Selection
      </b-button>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from "nuxt-property-decorator";
const selections = namespace("selections");
@Component
export default class BTNDeleteAll extends Vue {
  @Prop() store?: string;
  @Prop() component?: string;
  // visible: Boolean = false
  // @selections.Getter public selectionDepots!: Array<string>
  // @selections.Getter public selectionClients!: Array<strwatching>
  // @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void;
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void;
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void;
  // mounted () {
  //   if (this.store === 'depots') {
  //     if (this.selectionDepots.length > 0) {
  //       this.visible = true
  //     }
  //   } else if (this.store === 'clients') {
  //     if (this.selectionClients.length > 0) {
  //       this.visible = true
  //     }
  //   } else if (this.store === 'products') {
  //     if (this.selectionProducts.length > 0) {
  //       this.visible = true
  //     }
  //   }
  // }

  clearSelected() {
    if (this.store === "depots") {
      this.setSelectionDepots([]);
    } else if (this.store === "clients") {
      this.setSelectionClients([]);
    } else if (this.store === "products") {
      this.setSelectionProducts([]);
    }
  }
}
</script>
