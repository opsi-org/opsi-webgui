<template>
  <div>
    <b-dropdown-item-button @click="$bvModal.show(id + 'deleteClientModal')">
      <b-icon icon="trash" />  {{ $t('message.delete') }}
    </b-dropdown-item-button>
    <b-modal
      :id="id + 'deleteClientModal'"
      title="Delete Client"
      centered
      hide-footer
      no-fade
    >
      <span>
        {{ $t('message.deleteConfirm') }}<br>
        <b> {{ id }}</b>
        ?
      </span>
      <br>
      <b-row>
        <b-col>
          <b-button @click="deleteOpsiClient()">
            <b-icon icon="trash" /> {{ $t('message.delete') }}
          </b-button>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
interface DeleteClient {
  clientid: string
}

@Component export default class MDeleteClient extends Vue {
  @Prop({ }) id!: string
  deleteClient: DeleteClient = {
    clientid: ''
  }

  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  makeToast (message:string = '', title:any = '', variant:string = 'primary', autoHideDelay: number = 5000, append = false) {
    this.$bvToast.toast(message, {
      title,
      toaster: 'b-toaster-bottom-right',
      variant,
      autoHideDelay,
      appendToast: append
    })
  }

  async deleteOpsiClient () {
    this.$bvModal.hide(this.id + 'deleteClientModal')
    await this.$axios.$delete('/api/opsidata/clients/' + this.id)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.error(response)
        this.makeToast(this.id + this.$t('message.deleteMessage'), this.$t('message.success'), 'success', 5000)
        this.delFromSelectionClients(this.id)
      }).catch((error) => {
        this.makeToast((this as any).$t('message.errortext'), this.$t('message.error'), 'danger', 8000)
        // eslint-disable-next-line no-console
        console.error(error)
      })
  }
}
</script>

<style>
.modal-dialog {
  left: 0% !important;
}
</style>
