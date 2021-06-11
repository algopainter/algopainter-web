<template>
  <v-layout class="fill-height">
    <app-header style="z-index: 100000" />
    <v-main>
      <v-container :fluid="false" class="pt-3">
        <router-view :key="$route.fullPath"></router-view>

        <v-dialog
          v-model="showModal"
          persistent
          max-width="400"
        >
          <v-card>
            <v-card-title class="headline">
              Connect to your wallet
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row align="center" justify="center">
                  <v-col cols="6">
                    <v-layout align-center>
                      <v-flex shrink class="text-center">
                        <v-img @click="connectToMetaMask()" width="180" style="cursor: pointer" class="justify-center" :src="`/images/project/metamask.png`" />
                        <div class="text-center">Metamask</div>
                      </v-flex>
                    </v-layout>
                  </v-col>
                  <v-col cols="6">
                    <v-layout align-center>
                      <v-flex shrink class="text-center">
                        <v-img @click="connectToWalletConnect()" width="180" style="cursor: pointer" class="justify-center" :src="`/images/project/walletconnect.png`" />
                        <div class="text-center">WalletConnect</div>
                      </v-flex>
                    </v-layout>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
    <app-footer />
  </v-layout>
</template>

<script>
import AppHeader from '@/lib/components/ui/App/AppHeader';
import AppFooter from '@/lib/components/ui/App/AppFooter';

export default {
  components: {
    AppHeader,
    AppFooter,
  },

  data() {
    return {
      showModal: true,
    }
  },

  computed: {
    isConnected() {
      return this.$store.getters['user/isConnected'];
    },

    currentBlockNumber() {
      return this.$store.getters['user/currentBlockNumber'];
    },
  },

  watch: {
    isConnected() {
      this.showModal = !this.isConnected;
      this.watchBlockchain();
    }
  },

  mounted() {
  },

  methods: {
    connectToMetaMask() {
      if (!this.isConnected) {
        this.$store.dispatch('user/connectToMetaMask', {metamask: true});
      }
    },

    connectToWalletConnect() {
      if (!this.isConnected) {
        this.$store.dispatch('user/connectToMetaMask', {walletConnect: true});
      }
    },

    async watchBlockchain() {
      if(!this.isConnected) {
        return;
      }

      web3.eth.clearSubscriptions();
      await this.updateCurrentBlock();
      web3.eth.subscribe('newBlockHeaders', () => {
        this.updateCurrentBlock();
      });
    },

    async updateCurrentBlock() {
      const blockNumber = await web3.eth.getBlockNumber();
      this.$store.dispatch('user/updateCurrentBlockNumber', {blockNumber});
    }
  }
}
</script>

<style lang="scss">
.app-bar-full {
  .v-toolbar__content,
  .v-toolbar__extension {
    padding: 0;
  }
}
</style>