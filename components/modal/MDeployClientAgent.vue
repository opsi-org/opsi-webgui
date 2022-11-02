<template>
  <div data-testid="MDeployClientAgent">
    <b-button
      v-if="incontextmenu == false"
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0"
      :disabled="(config)?config.read_only:false"
      @click="$bvModal.show('event-modal-deployCA-' + clientId)"
    >
      <b-icon :icon="iconnames.product" />  <span class="clientagent"> {{ $t('label.clientagent') }} </span>
    </b-button>
    <div
      v-else
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0"
      :disabled="(config)?config.read_only:false"
      @click="$bvModal.show('event-modal-deployCA-' + clientId)"
      @keypress.enter="$bvModal.show('event-modal-deployCA-' + clientId)"
    >
      <b-icon :icon="iconnames.product" />  <span class="clientagent"> {{ $t('label.clientagent') }} </span>
    </div>

    <b-modal
      :id="'event-modal-deployCA-' + clientId"
      :title="$t('label.clientagent')"
      centered
      scrollable
      hide-footer
      hide-title
      no-fade
    >
      <AlertAAlert ref="clientagentAlert" />
      <b-form>
        {{ $t('Client ID:   ') }} {{ clientId }}
        <b-form-group :label="$t('form.username')" label-for="username">
          <b-form-input id="username" v-model="form.username" :placeholder="$t('form.username')" required />
        </b-form-group>
        <b-form-group :label="$t('form.password')" label-for="password">
          <b-form-input id="password" v-model="form.password" :placeholder="$t('form.password')" required />
        </b-form-group>
        <b-form-group :label="$t('table.fields.type')" label-for="type">
          <b-form-select id="type" v-model="form.type" :options="clientagenttypes" required />
        </b-form-group>
        <DivDComponentGroup class="float-right">
          <b-button
            class="float-right"
            variant="success"
            size="sm"
            :disabled="(config)?config.read_only:false"
            @click="deployclientagent()"
          >
            <b-icon :icon="iconnames.product" />  <span class="deploy"> {{ $t('label.clientagent') }} </span>
          </b-button>
        </DivDComponentGroup>
      </b-form>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Constants } from '../../mixins/uib-mixins'
import { DeployClientAgent } from '../../mixins/save'
const config = namespace('config-app')

interface FormClientAgent {
    clients: Array<string>,
    username: string,
    password: string,
    type: string
}

@Component({ mixins: [Constants, DeployClientAgent] })
export default class MDeployClientAgent extends Vue {
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: true }) clientId!: string
  show:boolean = false
  $axios: any
  $t: any
  $router: any
  iconnames: any
  deployClientAgent:any
  form: FormClientAgent = { clients: [this.clientId], username: '', password: '', type: 'windows' }
  clientagenttypes: Array<string> = ['windows', 'linux', 'mac']

  @config.Getter public config!: IObjectString2Boolean

  async deployclientagent () {
    if (!this.form.username || !this.form.password || !this.form.clients) {
      return
    }
    const hidemodal = true
    await this.deployClientAgent(this.form, hidemodal)
  }
}
</script>
