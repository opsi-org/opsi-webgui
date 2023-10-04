<template>
  <div v-if="Object.keys($scopedSlots).length > 0" data-testid="CMViewTable">
    <div v-if="viewMenu" class="right-click-backdrop bg-modal-backdrop" @click="closeMenu" @keypress="closeMenu" @click.right="closeMenu" />
    <div
      v-if="withButton !== false"
      id="contextmenu-content"
      @click.right="(e) => openMenu(e, item)"
      @keydown="(e) => openMenu(e, item)"
    >
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

@Component
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

  openMenu (payload, item) {
    this.viewMenu = true
    this.item = item
    if (payload) {
      const f = () => {
        (this.$refs.right as any)?.focus()
        this.setMenu(payload.y, payload.x)
      }
      Vue.nextTick(f.bind(this))
      payload.preventDefault()
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

#contextmenu-content .incontextmenu > .dropdown > .dropdown-menu > .dropdown-item  {
  padding: 0;
  padding-top:5px;
  background-color: transparent;
}
#contextmenu-content .btn-sm:not(.small).active,
#contextmenu-content .btn:not(.small):hover,
#contextmenu-content .btn:not(.small):hover {
  color: var(--general-fg) !important;
}
#contextmenu-content .incontextmenu:hover {
  color: var(--general-fg) !important;
  background-color: var(--general-bg-weak) !important;
}
#contextmenu-content .dropdown-item.contextmenu:hover,
#contextmenu-content .dropdown.contextmenu:hover {
  background-color: var(--general-bg-weak) !important;
}
#contextmenu-content .dropdown.contextmenu .btn,
#contextmenu-content .dropdown.contextmenu .btn:hover {
  background-color: transparent !important;
}
/* #contextmenu-content small > *:hover {
  background-color: var(--general-bg-weak) !important;
} */

#right-click-menu{
  color: var(--fg-context_menu_titles) !important;
  border: 1px solid var(--b-context_menu) !important;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);
  display: block;
  list-style: none;
  margin: 0px;
  padding: 0px;
  position: fixed;
  min-width: 250px;
  z-index: 1035;
}
#right-click-menu .dropdown-menu {
  border-color: var(--b-context_menu);
}
#right-click-menu .dropdown-menu .dropdown-item,
#right-click-menu .dropdown-menu,
#right-click-menu .dropdown,
#right-click-menu .dropdown .btn,
#right-click-menu .btn,
#right-click-menu.dropdown-menu {
  background-color: var(--bg-context_menu) ;
  color: var(--fg-context_menu) ;
}

#right-click-menu small > div > li.dropdown-item .dropdown-item {
  margin: 0px !important;
  padding: 0px !important;
}
#right-click-menu .contextmenu-part > .li-delimiter:last-of-type {
    border: unset;
    color: transparent;
}
#right-click-menu li:not(.li-delimiter) {
    margin: 0;
}
.bg-modal-backdrop {
  background-color: var(--bg-modal_backdrop);
}

#right-click-menu header {
  color: var(--fg-context_menu_titles);
  pointer-events: none;
  background-color: transparent;
  font-size: small;
  padding: 10px;
  padding-bottom: 0px;
}
.right-click-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  min-width: 100%;
  height: 100%;
  min-height: 100%;
  opacity: 0.8;
  overflow: hidden;
  z-index: 10; /* overlap also menus */
}
.dropdown-header {
  padding: 0px ;
  color: var(--secondary);
}
</style>
