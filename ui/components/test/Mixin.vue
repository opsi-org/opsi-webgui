<template>
  <div>
    Global mixin: {{ hello }} <br />
    Local mixin: {{ bye }}
  </div>
</template>

<script setup>
import { useBye } from '~/composables/mixins/useBye'
const hello = useHello() // mixin - global (automatically imported in each component)
const bye = useBye()  // mixin - local => needs to be imported manually
</script>
