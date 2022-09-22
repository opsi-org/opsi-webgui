<template>
  <div id="demo" v-on:click.right="openMenu">
    HELLO
    <h1 class="center">
      Right click anywhere to bring up a menu.
    </h1>
    <ul id="right-click-menu" tabindex="-1" ref="right" v-if="viewMenu" v-on:blur="closeMenu"  :style=" { top:top, left:left }">
        <li>First list item</li>
        <li>Second list item</li>
    </ul>
</div>
</template>

<script lang="ts">
  import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
  import { Constants } from '../../mixins/uib-mixins'

  @Component({ mixins: [Constants] })
  export default class CMViewTable extends Vue {
    $$:any
    @Prop({ default: 'key'}) item!: string


    viewMenu: boolean = false
    top: string = '0px'
    left: string ='0px'

    setMenu (top, left) {
      // let largestHeight = window.innerHeight - this.$$.right.offsetHeight - 25;
      // let largestWidth = window.innerWidth - this.$$.right.offsetWidth - 25;
      let largestHeight = window.innerHeight -  (this.$refs.right as any)?.offsetHeight - 50 ;
      let largestWidth = window.innerWidth - (this.$refs.right as any)?.offsetWidth - 50;
      var _top = top;

      var _left = left;
      // if (top > largestHeight) _top = largestHeight;
      // if (left > largestWidth) _left = largestWidth;

      this.top = _top + 'px';
      this.left = _left + 'px';
    }

      closeMenu() {
          this.viewMenu = false;
      }

      openMenu(e) {
          this.viewMenu = true;

          Vue.nextTick(function() {
              // this.$$.right.focus();
              (this.$refs.right as any)?.focus();

              this.setMenu(e.y, e.x)
          }.bind(this));
          e.preventDefault();
      }
};
</script>

<style lang="css" scoped>

#demo {
    width: 100%;
    height: 100%;
}

#right-click-menu{
    background: #FAFAFA;
    border: 1px solid #BDBDBD;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 250px;
    z-index: 999999;
}

#right-click-menu li {
    border-bottom: 1px solid #E0E0E0;
    margin: 0;
    padding: 5px 35px;
}

#right-click-menu li:last-child {
    border-bottom: none;
}

#right-click-menu li:hover {
    background: #1E88E5;
    color: #FAFAFA;
}

</style>