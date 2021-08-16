<template>
  <div>
    <b-dropdown-item-button @click="$bvModal.show(id + 'deleteClientModal')">
      <b-icon icon="trash" />  Delete
    </b-dropdown-item-button>
    <b-modal
      :id="id + 'deleteClientModal'"
      title="Delete Client"
      centered
      hide-footer
      no-fade
    >
      <span>
        Are you sure you want to delete the client<br>
        <b> {{ id }}</b>
        ?
      </span>
      <b-row>
        <b-col />
        <b-col cols="auto">
          <b-button @click="deleteOpsiClient()">
            <b-icon icon="trash" /> Delete
          </b-button>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

interface DeleteClient {
  clientid: string
}

@Component export default class MDeleteClient extends Vue {
  @Prop({ }) id!: string
  deleteClient: DeleteClient = {
    clientid: ''
  }

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
    // eslint-disable-next-line no-console
    console.log('DELETE: ', this.id)
    this.$bvModal.hide(this.id + 'deleteClientModal')
    const result = await this.$axios.$delete('/api/opsidata/clients/' + this.id)
    if (result.error === '') {
      this.makeToast(this.id + 'has been removed successfully.', this.$t('message.success'), 'success', 5000)
    } else { this.makeToast(result.error, this.$t('message.error'), 'danger', 8000) }
  }
}
</script>

<style>
.modal-dialog {
  left: 0% !important;
}
</style>
