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
      <b-icon :icon="icon.product" />  <span class="clientagent"> {{ $t('label.clientagent') }} </span>
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
      <b-icon :icon="icon.product" />  <span class="clientagent"> {{ $t('label.clientagent') }} </span>
    </div>

    <b-modal
      :id="'event-modal-deployCA-' + clientId"
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
      <b-form>
        <span class="clientId"> {{ $t('Client ID:   ') }} {{ clientId }} </span> <br>
        <span class="username"> {{ $t('form.username') }} </span> <b-form-input id="username" v-model="form.username" required /> <br>
        <span class="password"> {{ $t('form.password') }} </span> <b-form-input id="password" v-model="form.password" required /> <br>
        <span class="type"> {{ $t('table.fields.type') }} </span> <b-form-select id="type" v-model="form.type" :options="clientagenttypes" required /> <br>
        <div class="float-right mt-2">
          <b-button
            variant="success"
            size="sm"
            :disabled="(config)?config.read_only:false"
            @click="deployclientagent()"
          >
            <span class="deploy"> {{ $t('button.confirm') }} </span>
          </b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Icons } from '../../mixins/icons'
import { DeployClientAgent } from '../../mixins/post'
const config = namespace('config-app')

interface FormClientAgent {
    clients: Array<string>,
    username: string,
    password: string,
    type: string
}

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

  @config.Getter public config!: IObjectString2Boolean

  async deployclientagent () {
    if (!this.form.username || !this.form.password || !this.form.clients) {
      return
    }
    const modal = true
    await this.deployClientAgent(this.form, modal)
  }
}
</script>
