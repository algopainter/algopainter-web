<template>
  <div>
    <v-dialog
    persistent
    :value="open"
    width="500"
  >
    <v-card>
      <v-card-title>
        Network Info
      </v-card-title>
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  Property
                </th>
                <th class="text-left">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Network Id</td>
                <td>
                  <div>
                    {{ networkInfo.id }}
                  </div>
                </td>
              </tr>
              <tr>
                <td>Network Type</td>
                <td>
                  <div>
                    {{ networkInfo.type }}
                  </div>
                </td>
              </tr>
              <tr>
                <td>Account</td>
                <td>
                  <div 
                    class="d-inline-block text-truncate"
                    style="max-width: 250px;"
                    :title="account">
                    {{ account }}
                  </div>
                </td>
              </tr>
              <tr>
                <td>AlgoPainter Token Contract</td>
                <td>
                  <div 
                    class="d-inline-block text-truncate"
                    style="max-width: 250px;"
                    :title="contractAddress">
                    {{ contractAddress }}
                  </div>
                </td>
              </tr>
              <tr>
                <td>Gwei Smart Contract</td>
                <td>
                  <div 
                    class="d-inline-block text-truncate"
                    style="max-width: 250px;"
                    :title="gweiContractAddress">
                    {{ gweiContractAddress }}
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="success"
          text
          @click="close"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </div>
</template>

<script>

export default {
  props: ['open'],
  
  data() {
    return {
      address: '',
    }
  },

  computed: {
    isConnected() {
      return this.$store.getters['user/isConnected'];
    },

    account() {
      return this.$store.getters['user/account'];
    },

    networkInfo() {
      return this.$store.getters['user/networkInfo'];
    },

    gweiContractAddress() {
      return this.$store.getters['user/gweiContractAddress'];
    },

    contractAddress() {
      return this.$store.getters['user/contractAddress'];
    }
  },

  methods: {
    close() {
      this.$emit('close');
    },
  }
}
</script>
