<template>
  <el-form :label-width="mq.isMobile.value ? '': '230px'" :label-position="mq.isMobile.value ? 'top': 'right'" v-loading="isLoading">
    <el-form-item v-if="!isChild" :label="$t('table.fields.sourceClient')">
      <SelectSHosts type="clients" />
    </el-form-item>
    <div v-for="options,category,index in cloneClient" :key="index">
      <el-row>
        <b>{{ $t('title.' + category) }} </b>
      </el-row>
      <div v-for="(value, label, index) in options">
        <el-form-item :label="$t('table.fields.' + label)">
          <el-input v-if="label === 'hostId'">
            <template #append>
              <el-input class="border-none" />
            </template>
          </el-input>
          <el-checkbox v-else-if="typeof value == 'boolean'" v-model="cloneClient[category][label]" />
          <el-input v-else v-model="cloneClient[category][label]" :data-testid="label"/>
        </el-form-item>
      </div>
    </div>
    <el-form-item>
      <el-button> {{ $t('button.reset') }}</el-button>
      <el-button data-testid="cloneButton" type="primary">{{ $t('title.clone') }}</el-button>
    </el-form-item>
  </el-form>
  <!--
        <div v-if="label.toString() === 'hostId'" class="d-flex flex-nowrap">
          <b-form-input
            id="clientname"
            v-model="clientName"
            :aria-label="$t('table.name.client')"
            size="sm"
            type="text"
            trim
            :state="checkValid"
            required
          />
          <b-form-invalid-feedback :state="checkValid" class="w-25">
            <span v-if="clientIds.includes(clientName + domain)"> {{ $t('message.formvalid.clientExists') }} </span>
          </b-form-invalid-feedback>
          <b-form-input
            id="domainName"
            v-model="domainName"
            class="domainName"
            :aria-label="$t('table.name.domain')"
            size="sm"
            type="text"
            trim
            required
          />
        </div>
      </template>
    </GridGFormItem>-->
</template>

<script setup lang="ts">
const props = defineProps({
  id: { type: String, default: '' },
  type: { type: String, default: 'clients' },
  isChild: { type: Boolean, default: false }
})

const mq = useMQ()
const isLoading = ref(false)
const cloneClient = ref({
  targetclient: {
    hostId: '',
    ipAddress: '',
    hardwareAddress: '',
    systemUUID: ''
  },
  options: {
    configs: false,
    products: false,
    productProperties: false
  }
})

// import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
// import { Icons } from '../../mixins/icons'
// import { Strings } from '../../mixins/strings'
// import { Client } from '../../mixins/get'
// import { AlertToast } from '../../mixins/component'
// import { CloneClient } from '../../.utils/types/tobjects'
// const selections = namespace('selections')
// @Component({ mixins: [Icons, Strings, AlertToast, Client] })
// export default class VClientClone extends Vue {
//   showToastWarning:any // mixin
//   showToastSuccess: any // from mixin AlertToast
//   showToastError: any // from mixin AlertToast
//   getClientIdList:any
//   icon: any
//   t_fixed: any
//   $axios:any
//   $t:any

//   @Prop({ }) id!: string
//   @Prop({ default: false }) 'asChild'!: string
//   @Prop({ default: false }) 'closeroute'!: string

//   @selections.Getter public selectionDepots!: Array<string>

//   clientName: string = ''
//   domain: string = ''
//   isLoading: boolean = false
//   clientIds: Array<string> = []

//   cloneclient: CloneClient = {
//     target: {
//       hostId: '',
//       ipAddress: '',
//       hardwareAddress: '',
//       systemUUID: ''
//     },
//     options: {
//       configs: false,
//       products: false,
//       productPropeties: false
//     }
//   }

//   get domainName () {
//     const result = this.id.substring(this.id.indexOf('.'))
//     this.domain = result
//     return result
//   }

//   set domainName (val: string) {
//     this.domain = val
//   }

//   get checkValid () {
//     return this.clientName.length > 0 && !Number.isInteger(parseInt(this.clientName.charAt(0))) && !this.clientIds.includes(this.clientName + this.domain)
//   }

//   async fetch () {
//     await this.fetchClients()
//   }

//   async fetchClients () {
//     this.clientIds = await this.getClientIdList(this.selectionDepots)
//   }

//   async cloneClient () {
//     this.isLoading = true
//     this.cloneclient.target.hostId = this.clientName + this.domain
//     await this.$axios.$post(`/api/opsidata/clients/${this.id}/clone`, this.cloneclient)
//       .then((response) => {
//         this.showToastSuccess(response)
//       })
//       .catch((error) => {
//         this.showToastError(error)
//       })
//     this.isLoading = false
//   }

//   resetForm () {
//     this.clientName = ''
//     this.cloneclient = {
//       target: {
//         hostId: '',
//         ipAddress: '',
//         hardwareAddress: '',
//         systemUUID: ''
//       },
//       options: {
//         configs: false,
//         products: false,
//         productPropeties: false
//       }
//     } as CloneClient
//   }
// }
</script>

<style>
.VClientClone {
  overflow-x: hidden;
  padding-left: 10px;
}
</style>
