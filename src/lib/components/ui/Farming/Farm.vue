<template>
  <v-card class="farm-box" elevation="2">
    <farm-interaction 
      :pid="pid"
      :tokenSymbol="tokenSymbol"
      :baseTokenSymbol="baseTokenSymbol"
      :open="isFarmInteractionOpen" 
      :isDeposit="isDeposit"
      :currentBalance="currentBalance"
      :depositFee="depositFee"
      :remainingDays="remainingDays"
      :stakedAmount="stakedAmount"
      @close="close"
      @deposit="depositAmount"
      @withdraw="withdrawAmount"
      />
    <v-card-title>
      <v-badge
        bordered
        color="primary"
        :content="`${multiplier}x`"
        overlap
        offset-x="-2"
      >
        {{title}}
      </v-badge>
    </v-card-title>
    <v-divider class="mx-4"></v-divider>
    <v-card-text>
      <div
        class="d-flex pa-2 justify-center align-center mt-n2"
      >
        <div class="mr-1">
          <img src="/images/algo-logo-200x200.png" width="48" />
        </div> 
        <div>
          {{tokenSymbol}}
          <span v-if="baseTokenSymbol">/ {{baseTokenSymbol}}</span>
        </div>
        
      </div>
      <div
        class="d-flex pa-2 justify-space-between align-center mt-n4"
      >
        <div>Lock time</div>
        <div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div
                v-bind="attrs"
                v-on="on"
              >
                <v-chip
                  v-if="remainingDays > 0"
                  color="error"
                >
                  {{remainingDays}}d
                </v-chip>
                <v-chip
                  v-else
                  color="success"
                >
                  {{remainingDays}}d
                </v-chip>
              </div>
            </template>
            <span v-if="remainingDays > 0">To withdraw the deposited amount you need to wait {{remainingDays}} days</span>
            <span v-if="remainingDays <= 0">You can withdraw the amount at any time</span>
          </v-tooltip>
        </div>
      </div>
      <div
        class="d-flex pa-2 justify-space-between align-center mt-n3"
      >
        <div>Deposit Fee</div>
        <div>
          <v-alert
              dense
              text
              type="error"
              v-if="depositFee > 0" 
            >
            <percentage-amount :amount="depositFee" />
          </v-alert>
          <span v-else>
            <v-alert
              dense
              text
              type="success"
            >
              No Fees
            </v-alert>
          </span>
        </div>
      </div>

      <div
        class="d-flex pa-2 justify-space-between align-center mt-n3"
      >
        <div>APR</div>
        <div><percentage-amount :amount="apr" />
        </div>
      </div>
      <div
        class="d-flex pa-2 justify-space-between align-center mt-n4"
        outlined
        tile
      >
        <div>EARN</div>
        <div>{{tokenSymbol}}</div>
      </div>
      
      <div
        class="d-flex pa-2 justify-space-between align-center  mt-n2"
      >
        <div>
          <small>
            <amount :amount="pendingTokens" :decimals="2" />${{tokenSymbol}}
          </small>
        </div>
        <div>
          <v-btn
            color="primary"
            @click="harvest()"
          >
            Harvest
          </v-btn>
        </div>
      </div>
      <div
        class="d-flex pa-2 justify-space-between align-center"
        outlined
        tile
      >
        <span v-if="baseTokenSymbol">
          {{tokenSymbol}}/{{baseTokenSymbol}} LP Staked
        </span>
        <span v-else>
          {{tokenSymbol}} Staked
        </span>
      </div>
      <div
        class="mr-auto d-flex pa-2 justify-space-between align-center mt-n4"
      >
        <div>
          <amount :amount="stakedAmount" :decimals="2" />
          <span v-if="baseTokenSymbol">
            LP Token
          </span>
          <span v-else>
            {{tokenSymbol}}
          </span>
        </div>
        <div class="ml-auto" style="margin: 10px">
          <v-btn
            color="primary"
            @click="deposit()"
          >
            +
          </v-btn>
        </div>
        <div>
          <v-btn
            color="primary"
            @click="withdraw()"
          >
            -
          </v-btn>
        </div>
      </div>
      <div
        class="d-flex pa-2 justify-space-between align-center mt-n4"
      >
        <div><small>Total Liquidity</small></div>
        <div>
          <button><small>$ <amount :amount="totalLiquidity" :decimals="2" /></small></button>
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        outlined
        v-if="baseTokenSymbol"
        @click="goToLiquidity()"
      >
        Providy Liquidity
        <v-icon>mdi-share</v-icon>
      </v-btn>
      <v-btn
        color="primary"
        outlined
        @click="goToExchange()"
      >
        Buy ${{tokenSymbol}}
        <v-icon>mdi-share</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import Amount from '@/lib/components/ui/Utils/Amount.vue';
import PercentageAmount from '@/lib/components/ui/Utils/PercentageAmount.vue';
import FarmInteraction from '@/lib/components/ui/Farming/FarmInteraction.vue';

export default {
  props: [
    'title',
    'pid',
    'baseTokenSymbol', 
    'tokenSymbol', 
    'baseTokenAddress', 
    'tokenAddress', 
    'multiplier', 
    'unlocktime', 
    'apr', 
    'depositFee', 
    'pendingTokens',
    'stakedAmount',
    'totalLiquidity',
    'currentBalance',
  ],
  
  components: {
    PercentageAmount,
    Amount,
    FarmInteraction,
  },

  data() {
    return {
      isFarmInteractionOpen: false,
      isDeposit: true,
    }
  },

  computed: {
    remainingDays() {
      const difference = this.unlocktime - Date.now() / 1000;
      const days = Math.floor(difference/60/60/24);
      return days > 0 ? days : 0;
    }
  },

  methods: {
    harvest() {
      this.$emit('harvest');
    },

    deposit() {
      this.isFarmInteractionOpen = true;
      this.isDeposit = true;
    },

    depositAmount({pid, amount}) {
      this.close();
      this.$emit('deposit', {pid, amount});
    },

    withdrawAmount({pid, amount}) {
      this.close();
      this.$emit('withdraw', {pid, amount});
    },

    withdraw() {
      this.isDeposit = false;
      this.isFarmInteractionOpen = true;
    },

    close() {
       this.isFarmInteractionOpen = false;
    },

    goToLiquidity() {
      const url = process.env.VUE_APP_LIQUIDITY_EXCHANGE_LINK
        .replace('{tokenAddress}', this.tokenAddress)
        .replace('{baseTokenAddress}', this.baseTokenAddress);

      window.open(url);
    },

    goToExchange() {
      const url = process.env.VUE_APP_SWAP_EXCHANGE_LINK
        .replace('{tokenAddress}', this.tokenAddress);

      window.open(url);
    }
  }
}
</script>
