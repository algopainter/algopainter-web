<template>
  <v-dialog
      persistent
      :value="open"
      width="500"
    >
    <v-card>
      <v-card-title color="red">
        <span class="mr-1" v-if="isDeposit">Deposit</span>
        <span class="mr-1" v-else>Witdraw</span>
        <span>
          {{tokenSymbol}}
          <span v-if="baseTokenSymbol">/ {{baseTokenSymbol}} LP Token</span>
        </span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <small>
                Current Balance: 
                  <amount :amount="displayedBalance" :decimals="2" />
                 <span>
                  {{tokenSymbol}}
                  <span v-if="baseTokenSymbol">/ {{baseTokenSymbol}} LP Token</span>
                </span>
              </small>
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12">
              <v-text-field
                type="number"
                :label="baseTokenSymbol ? 'LP Token' : tokenSymbol"
                v-model="amount"
                required
              >
                <div slot="append">
                  <v-btn
                    color="primary"
                    text
                    @click="updateMaxAmount()"
                  >
                    Max
                  </v-btn>
                </div>
              </v-text-field>
            </v-col>
          </v-row>
          <template v-if="isDeposit">
            <v-row class="mt-n8" v-if="depositFee > 0">
              <v-col cols="12">
              <v-checkbox
                v-model="depositFeeChecked"
                label="I understand that there is a fee to deposit in this farm and it will not be refunded."
              ></v-checkbox>
              </v-col>
            </v-row>
            <v-row class="mt-n8" v-if="remainingDays > 0">
              <v-col cols="12">
              <v-checkbox
                v-model="timelockChecked"
                label="I understand that the deposited amount will be locked for the specified time and I will not be able to withdraw until the specified time."
              ></v-checkbox>
              </v-col>
            </v-row>
            <v-row class="mt-n6" v-if="depositFee > 0">
              <v-col cols="12">
                <v-alert
                  dense
                  outlined
                  type="error"
                >
                  <strong>Deposit fee</strong>: <percentage-amount :amount="depositFee" />
                </v-alert>
              </v-col>
            </v-row>
          </template>
          <template v-else>
            <v-row class="mt-n8">
              <v-col cols="12">
              <v-checkbox
                v-model="withdrawChecked"
                label="I understand when I withdraw my tokens I will not receive rewards and the deposit fee will not be refunded."
              ></v-checkbox>
              </v-col>
            </v-row>
          </template>
        </v-container>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn
          color="grey"
          text
          @click="close()"
        >
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="isDeposit"
          color="success"
          @click="deposit"
        >
          Deposit
        </v-btn>
        <v-btn
          v-else
          color="error"
          @click="withdraw"
        >
          Withdraw
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import Amount from '@/lib/components/ui/Utils/Amount.vue';
import PercentageAmount from '@/lib/components/ui/Utils/PercentageAmount.vue';

export default {
  components: 
  { 
    Amount,
    PercentageAmount,
  },
  props: [
    'open',
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
    'remainingDays',
    'isDeposit',
  ],

  data() {
    return {
      amount: 0,
      depositFeeChecked: this.depositFee == 0,
      timelockChecked: this.remainingDays == 0,
      withdrawChecked: false,
    }
  },

  computed: {
    displayedBalance() {
      return this.isDeposit ? this.currentBalance : this.stakedAmount;
    }
  },

  methods: {
    deposit() {
      this.$emit('deposit', {pid: this.pid, amount: this.amount});
    },

    withdraw() {
      this.$emit('withdraw', {pid: this.pid, amount: this.amount});
    },

    close() {
      this.amount = 0;
      this.$emit('close');
    },

    updateMaxAmount() {
      this.amount = this.displayedBalance;
    }
  }
}
</script>