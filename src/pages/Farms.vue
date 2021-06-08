<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-toolbar class="elevation-0">
        <v-toolbar-title>Farms</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
    </v-card>

  <v-divider class="my-2"></v-divider>
  {{currentBlockNumber}}
  <v-container fluid>
    <v-row dense v-for="farm in farms" :key="farm.pid">
      <v-col>
        <farm 
          :title="farm.title"

          :pid="farm.pid"
          :tokenSymbol="farm.tokenSymbol" 
          :tokenAddress="farm.tokenAddress[networkId]" 
          :baseTokenSymbol="farm.baseTokenSymbol" 
          :baseTokenAddress="farm.baseTokenAddress ? farm.baseTokenAddress[networkId] : null" 
          :multiplier="farm.multiplier" 
          :pendingTokens="farm.pendingTokens"
          :depositFee="farm.depositFee"
          :stakedAmount="farm.stakedAmount"

          :apr="112400"
          :unlocktime="1631712407"
          :totalLiquidity="100000"
          :currentBalance="farm.userCurrentBalance"
          
          @harvest="harvest" 
          @deposit="deposit" 
          @withdraw="withdraw" 
        />
      </v-col>
    </v-row>
  </v-container>
  </div>
</template>

<script>
import PaintingCard from '@/lib/components/ui/PaintingCard';
import Farm from '@/lib/components/ui/Farming/Farm.vue';
import AlgoPainterMasterChefV2Proxy from '@/lib/eth/AlgoPainterMasterChefV2Proxy';

export default {
  components: {
    PaintingCard,
    Farm,
  },

  data() {
    return {
      page: 1,
      pageCount: 0,
      pageSize: 8,
      paintings: [],
      loading: true,

      farms: [],
    };
  },

  computed: {
    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
    },

    networkInfo() {
      return this.$store.getters["user/networkInfo"];
    },

    networkId() {
      return this.isConnected && this.networkInfo ? this.networkInfo.id.toString() : "";
    },

    account() {
      return this.$store.getters["user/account"];
    },

    currentBlockNumber() {
      return this.$store.getters["user/currentBlockNumber"];
    }
  },

  watch: {
    isConnected() {
      this.loadData();
    },

    account() {
      this.loadData();
    },

    currentBlockNumber() {
      this.loadData();
    }
  },

  mounted() {
    this.loadData();
  },

  methods: {
    harvest() {
      alert(2);
    },

    deposit({pid, amount}) {
      const controller = new AlgoPainterMasterChefV2Proxy();
      controller.deposit(this.networkId, this.account, pid, amount);
    },

    withdraw({pid, amount}) {
      alert(`Deposit ${pid} ${amount}`);
      
      const controller = new AlgoPainterMasterChefV2Proxy();
      controller.deposit(this.networkId, this.account, pid, amount);
    },

    goToNewPainting() {
      this.$router.push(`/paintings/new`);
    },

    async loadData() {
      if (!this.isConnected) {
        return;
      }

      const controller = new AlgoPainterMasterChefV2Proxy();
      this.farms = await controller.getFarms(this.networkId, this.account);
    },
  },
};
</script>

<style scoped>

</style>