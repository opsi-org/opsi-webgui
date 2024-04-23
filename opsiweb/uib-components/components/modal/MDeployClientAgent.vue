<template>
  <div data-testid="MDeployClientAgent">
    <b-button
      v-if="incontextmenu == false"
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0"
      :disabled="config?.read_only"
      @click="$bvModal.show('event-modal-deployCA-' + clientId + '-context-menu-' + incontextmenu)"
    >
      <IconIIcon :icon="icon.product" />  <span class="clientagent"> {{ $t('label.clientagent') }} </span>
    </b-button>
    <div
      v-else
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0 incontextmenu"
      :disabled="config?.read_only"
      @click="$bvModal.show('event-modal-deployCA-' + clientId + '-context-menu-' + incontextmenu)"
      @keypress.enter="$bvModal.show('event-modal-deployCA-' + clientId + '-context-menu-' + incontextmenu)"
    >
      <IconIIcon :icon="icon.product" />  <span class="clientagent"> {{ $t('label.clientagent') }} </span>
    </div>

    <b-modal
      :id="'event-modal-deployCA-' + clientId + '-context-menu-' + incontextmenu"
      :title="$t('label.clientagent')"
      data-testid="MDeployClientAgentModal"
      centered
      scrollable
      hide-footer
      hide-title
      no-fade
      no-stacking
    >
      <AlertAAlert ref="clientagentAlert" />

      <GridGFormItem :label="$t('form.clientId')" variant="longlabel" labelclass="clientId">
        <template #value>
          <b-form-input :value="clientId" size="sm" disabled />
        </template>
      </GridGFormItem>
      <GridGFormItem :label="$t('form.username')" variant="longlabel" labelclass="username">
        <template #value>
          <b-form-input id="username" v-model="form.username" size="sm" required />
        </template>
      </GridGFormItem>
      <GridGFormItem :label="$t('form.password')" variant="longlabel" labelclass="password" classvalue="d-inline-flex">
        <template #value>
          <b-form-input id="password" v-model="form.password" size="sm" required :type="showPassword? 'text': 'password'"/>
          <b-button variant="primary" :pressed.sync="showPassword" size="sm" class="text-light" >
            <span class="sr-only">{{ showPassword? $t('label.hide', { item: $t('form.password') }) : $t('label.show', { item: $t('form.password') }) }}</span>
            <IconIIcon :icon="showPassword ? icon.valueShow : icon.valueHide" />
          </b-button>
        </template>
      </GridGFormItem>
      <GridGFormItem :label="$t('table.fields.type')" variant="longlabel" labelclass="type">
        <template #value>
          <b-form-select id="type" v-model="form.type" size="sm" :options="clientagenttypes" required />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #value>
          <b-button
            variant="success"
            size="sm"
            class="float-right"
            :disabled="config?.read_only"
            @click="deployopsiclientagent()"
          >
            <span class="deploy"> {{ $t('button.confirm') }} </span>
          </b-button>
        </template>
      </GridGFormItem>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Icons } from '../../mixins/icons'
import { DeployClientAgent } from '../../mixins/post'
import { FormClientAgent } from '../../.utils/types/tobjects'
const config = namespace('config-app')

@Component({ mixins: [Icons, DeployClientAgent] })
export default class MDeployClientAgent extends Vue {
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: true }) clientId!: string
  show:boolean = false
  $axios: any
  $t: any
  $router: any
  icon: any
  deployClientAgent:any
  form: FormClientAgent = { clients: [this.clientId], username: '', password: '', type: 'windows' }
  clientagenttypes: Array<string> = ['windows', 'linux', 'mac']
  showPassword: boolean = false

  @config.Getter public config!: IObjectString2Boolean

  async deployopsiclientagent () {
    if (!this.form.username || !this.form.password || !this.form.clients) {
      return
    }
    const modal = true
    await this.deployClientAgent(this.form, modal, this.incontextmenu)
  }
}
</script>
