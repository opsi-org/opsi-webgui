<template>
  <el-form label-width="250px" class="diagnostics-form" v-if="Object.keys(data).length > 0">
    <div v-for="values, category in data" :key="category">
      <template v-if="values && Object.keys(values).length !== 0">
        <el-text tag="b"> {{ category }} </el-text><br>
        <el-form-item v-for="v, k in values" :label="k.toString()" :key="k">
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
.diagnostics-form .el-form-item {
  margin-bottom: 7px;
}
.diagnostics-form .el-form-item__label{
  height: 28px;
  line-height: 28px;
}
.diagnostics-form .el-form-item__content {
  line-height: 28px;
}
</style>
