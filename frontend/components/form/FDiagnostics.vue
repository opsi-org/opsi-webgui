<template>
  <el-form label-width="250px">
    <div v-for="values, category in data">
      <template v-if="values && Object.keys(values).length !== 0">
        <el-text tag="b"> {{ category }} </el-text><br>
        <el-form-item v-for="v, k in values" :label="k.toString()">
            <template v-if="typeof v == 'object'">
              <div class="scrollValue">
                <pre>{{ JSON.stringify(v, null, 2) }}</pre>
              </div>
            </template>
            <template v-else>
              {{ v }}
            </template>
        </el-form-item>
      </template>
    </div>
  </el-form>
</template>

<script setup lang="ts">
const props = defineProps({
  data: { type: Object, required: true }
})
</script>
<style>
div.scrollValue {
  max-height: 400px;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
