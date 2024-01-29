<template>
  <el-popover :placement="useMQ().isMobile.value ? 'auto': 'right'" :width="400" trigger="click" :ref="props.data.nodeLabel+props.data.action">
    <template #reference>
      <el-button size="small">
        <IconIIcon v-for="subaction in props.data.action.split('-')" :icon="icons[subaction]" />
      </el-button>
    </template>
    <el-text tag="b">{{ $t('group.'+props.data.action) }}</el-text> - <el-text tag="i">{{ props.data.nodeLabel }}</el-text>
    <el-form label-position="top" class="mt-3">
      <template v-if="props.data.action == 'group-add'">
        <el-form-item
          v-for="value,label,index in addSubGroup"
          :key="index"
          :label="$t('table.fields.'+label)"
          :class="{ 'd-none': label=='parentGroupId' }"
        >
          <el-input v-model="addSubGroup[label]" />
        </el-form-item>
        <el-button class="float-right" type="success" data-testid="createSubGroup">
          {{ $t("button.create") }}
        </el-button>
      </template>
      <template v-else-if="props.data.action == 'client-add' || props.data.action == 'product-add'">
        <el-form-item :label="$t('label.selectChildren')">
          <el-scrollbar height="300px">
            <el-checkbox-group v-model="selectedChildren">
              <div v-for="item in idList" :key="item">
                <el-checkbox size="small" :label="item" />
              </div>
            </el-checkbox-group>
          </el-scrollbar>
        </el-form-item>
        <el-button class="float-right" type="success" data-testid="addprodToSelectedGroup">
          {{ $t("button.add") }}
        </el-button>
      </template>
      <template v-else-if="props.data.action == 'client-delete' || props.data.action == 'product-delete'">
        <small> {{ $t('group.deleteOnlyAssignments.confirm', {type: 'client'}) }}</small>
        <el-button class="float-right" type="danger" data-testid="removeAssignments">
          {{ $t("button.delete") }}
        </el-button>
      </template>
      <template v-else-if="props.data.action == 'delete'">
        <small>{{ $t('group.removeClient.confirm') }}</small>
        <el-button type="danger" class="float-right">
          {{ $t('button.delete') }}
        </el-button>
      </template>
      <template v-else-if="props.data.action == 'edit'">
        <el-form-item v-for="value,label,index in updateGroup" :key="index" :label="$t('table.fields.'+label)">
          <el-input v-model="addSubGroup[label]" />
        </el-form-item>
        <el-button class="float-right" type="success" data-testid="updateGroup">
          {{ $t("button.update") }}
        </el-button>
      </template>
      <template v-else-if="props.data.action == 'copy'">
        <el-tree />
        <el-button type="success" class="float-right">
          {{ $t('button.copy') }}
        </el-button>
      </template>
      <template v-else> No action available </template>
    </el-form>
    <!-- {{ props.data.category }} : {{ props.data.nodeType }} : {{ props.data.nodeLabel }} : {{ props.data.action }} -->
  </el-popover>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useNotification } from '~/composables/mixins/useComponent';
import {useIcons} from '../../composables/mixins/useIcons'
const props = defineProps({
  data: { type: Object, required: true },
  idList: { type: Array<any>, required: true}
})
const icons = useIcons()
const selectedChildren = ref([])

const addSubGroup = reactive({
  parentGroupId: '',
  groupId: '',
  description: '',
  notes: ''
})
const updateGroup = reactive({
  parent: '',
  description: '',
  notes: ''
})
</script>