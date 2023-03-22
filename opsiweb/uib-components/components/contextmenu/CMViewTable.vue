<template>
  <div v-if="Object.keys($scopedSlots).length > 0" data-testid="CMViewTable">
    <div v-if="viewMenu" class="right-click-backdrop bg-primary" @click="closeMenu" @keypress="closeMenu" @click.right="closeMenu" />
    <div v-if="withButton !== false" id="contextmenu-content" @click.right="openMenu" @keydown="openMenu">
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
        <slot name="contextcontentbottom" :itemkey="itemkey" />
      </ul>
    </div>
    <div v-else id="contextmenu-content">
      <ul
        v-if="viewMenu"
        id="right-click-menu"
        ref="right"
        size="sm"
        class="dropdown-menu show"
        tabindex="-1"
        :style=" { top:top, left:left }"
      >
        <header class="li-delimiter">
          {{ $t('table.contextmenu.header-specific', {id: itemkey}) }}
        </header>
        <div
          v-for="slotName in Object.keys($scopedSlots).filter(x => !x.includes('general'))"
          :key="slotName"
          :class="'specific contextmenu-part contextmenu-'+slotName.replace('contextmenu', '')"
        >
          <small><slot :name="slotName" :itemkey="primaryKey? item[primaryKey]:item" /></small>
          <li class="li-delimiter" />
        </div>
        <header class="li-delimiter">
          {{ $t('table.contextmenu.header-general', {id: itemkey}) }}
        </header>
        <div
          v-for="slotName in Object.keys($scopedSlots).filter(x => x.includes('general'))"
          :key="slotName"
          :class="'general contextmenu-part contextmenu-'+slotName.replace('contextmenu', '')"
        >
          <small><slot :name="slotName" :itemkey="primaryKey? item[primaryKey]:item" /></small>
          <li class="li-delimiter" />
        </div>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * slot name for context menus start with contextcontent
 * (rest doesnt matter)
 */
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

  get itemkey () {
    return this.primaryKey ? this.item[this.primaryKey] : this.item
  }

  created () {
    // workaround to init the column visibility(inits column visibility component)
    // this.viewMenu = true
    // setTimeout(() => { this.viewMenu = false }, 1)
  }

  setMenu (top, left) {
    const t = (top - 50)
    const menuheight = (this.$refs.right as any)?.offsetHeight
    if (t + menuheight > window.innerHeight) {
      // fix position if outside visible height
      this.top = (window.innerHeight - menuheight - 10) + 'px'
    } else if (t < 0) {
      // fix position if outside visible height
      this.top = '0px'
    } else {
      this.top = t + 'px'
    }
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
    if (e) {
      Vue.nextTick(function () {
        (this.$refs.right as any)?.focus()

        this.setMenu(e.y, e.x)
      }.bind(this))
      e.preventDefault()
    } else {
      this.setMenu(0, 0)
    }
  }
}
</script>

<style lang="css">

#contextmenu-content {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
}

#right-click-menu{
    border: 1px solid #BDBDBD;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    position: fixed;
    min-width: 250px;
    z-index: 200;
}

/* #right-click-menu small > li.dropdown-item .btn-outline-primary {
  color:blue;
} */
#right-click-menu small > div > li.dropdown-item .dropdown-item {
  margin: 0px !important;
  padding: 0px !important;
}
#right-click-menu li.li-delimiter:first,
  #right-click-menu .contextmenu-part > .li-delimiter:last-of-type {
    border: unset;
    color: transparent;
}
#right-click-menu li:not(.li-delimiter) {
    margin: 0;
}

#right-click-menu header {
  color: var(--log-muted);
  pointer-events: none;
  background-color: transparent;
  font-size: small;
}
.right-click-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  min-width: 100%;
  height: 100%;
  min-height: 100%;
  opacity: 0.2;
  overflow: hidden;
  z-index: 10; /* overlap also menus */
}
.dropdown-header {
  padding: 0px ;
  color: var(--light);
}
</style>