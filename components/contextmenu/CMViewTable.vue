<template>
  <div>
    <div v-if="viewMenu" class="right-click-backdrop bg-dark" @click="closeMenu" @keypress="closeMenu" @click.right="reopenMenu" />
    <div v-if="withButton !== false" id="demo" @click.right="openMenu" @keydown="openMenu">
      <slot name="item" />
      <ul
        v-if="viewMenu"
        id="right-click-menu"
        ref="right"
        tabindex="-1"
        class="dropdown-menu show"
        :style=" { top:top, left:left }"
      >
        <slot name="contextcontent" />
        <li v-if="Object.keys($scopedSlots).includes('contextcontent') && Object.keys($scopedSlots).includes('contextcontentbottom')" class="li-delimiter" />
        <slot name="contextcontentbottom" :itemkey="primaryKey? item[primaryKey]:item" />
      </ul>
    </div>
    <div v-else id="demo">
      <ul
        v-if="viewMenu"
        id="right-click-menu"
        ref="right"
        class="dropdown-menu show"
        tabindex="-1"
        :style=" { top:top, left:left }"
      >
        <div
          v-for="slotName in Object.keys($scopedSlots)"
          :key="slotName"
        >
          <li class="li-delimiter" />
          <slot :name="slotName" :itemkey="primaryKey? item[primaryKey]:item" />
        </div>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class CMViewTable extends Vue {
  slotScope:any
  //   @Prop({ default: 'key' }) item!: string
  @Prop({ default: undefined }) primaryKey!: string
  @Prop({ default: false }) contextClienttable!: boolean
  @Prop({ default: false }) withButton!: boolean

  viewMenu: boolean = false
  top: string = '0px'
  left: string = '0px'
  item: any = { item: '<not found>' }

  setMenu (top, left) {
    this.top = (top - 50) + 'px'
    this.left = (left - 70) + 'px'
  }

  closeMenu () {
    this.viewMenu = false
  }

  reopenMenu (e, item) {
    this.closeMenu()
    this.openMenu(e, item)
  }

  openMenu (e, item) {
    this.viewMenu = true
    this.item = item
    Vue.nextTick(function () {
      // this.$$.right.focus();
      (this.$refs.right as any)?.focus()

      this.setMenu(e.y, e.x)
    }.bind(this))
    e.preventDefault()
  }
}
</script>

<style lang="css" scoped>

#demo {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
    /* background-color: inherit !important; */
}

#right-click-menu{
    /* color: var(--light) !important; */
    /* background-color: inherit !important; */
    /* background: #FAFAFA; */
    border: 1px solid #BDBDBD;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    /* display: flex; */
    min-width: 250px;
    z-index: 999999;
    opacity: 1 !important;


}
#right-click-menu li.li-delimiter {
    border-bottom: 1px solid #E0E0E0;
    border-color: var(--light);
}
#right-click-menu li.li-delimiter:first {
    border-bottom: unset;
}
#right-click-menu li:not(.li-delimiter) {
    /* border-bottom: 1px solid #E0E0E0; */
    margin: 0;
    padding: 5px 35px;
}

#right-click-menu li:not(.li-delimiter):last-child {
    border-bottom: none;
}

#right-click-menu li:not(.li-delimiter):hover {
    background: #1E88E5;
    color: #FAFAFA;
}
.right-click-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  min-width: 100%;
  height: 100%;
  min-height: 100%;
  opacity: 0.5;
}
</style>
