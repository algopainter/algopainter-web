<template>
  <div>
    <v-container>
      <v-row dense>
        <v-col
          v-for="(stat, i) in stats"
          :key="i"
          cols="12"
          md="6"
          lg="3"
        >
          <v-card class="pa-3 text-center">
            <div class="overline mb-2">
              <v-icon :color="stat.color">{{stat.icon}}</v-icon>
              {{ stat.title }}
            </div>
            <div class="text-h4">{{ stat.value }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-container>
      <v-card color="grey lighten-4" flat>
        <v-toolbar class="elevation-0">
          <v-toolbar-title>New Painting</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn v-if="isMinted" color="grey" class="mr-4" outlined to="/">
            <v-icon left>mdi-view-module</v-icon>
            Back to Gallery
          </v-btn>
        </v-toolbar>
      </v-card>
      <v-divider class="my-2"></v-divider>
      <v-container>
        <v-row dense>
          <v-col cols="12">
            <v-alert v-if="errorMsg" outlined type="error" prominent>
              {{ errorMsg }}
            </v-alert>
            <v-alert v-if="isWaitingTransaction" outlined type="info" prominent>
              <v-progress-circular
                indeterminate
                color="info"
              ></v-progress-circular>
              Waiting for the first confirmation, if you close this window remember to check the status in your wallet!
            </v-alert>
            <v-alert v-if="isMinted" outlined type="success" prominent>
              Your amazing painting has been successfully minted!
            </v-alert>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col lg="6" sm="12">
            <v-img
              class="mx-auto"
              width="300"
              src="/images/project/gwei.png"
            ></v-img>
          </v-col>
          <v-col lg="6" sm="12">
            <v-card class="pa-3"  v-if="hasAllowance">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="entity.text"
                    :counter="64"
                    label="Give me an inspirational text"
                    required
                    autocomplete="off"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="mt-n8">
                  <v-radio-group v-model="entity.useRandom" row>
                    <template v-slot:label>
                      <div>Apply random color inversion</div>
                    </template>
                    <v-radio label="Yes" value="true"></v-radio>
                    <v-radio label="No" value="false"></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col
                  v-if="entity.useRandom === 'true'"
                  cols="12"
                  class="mt-n6"
                >
                  <v-text-field
                    v-model="entity.probability"
                    :counter="64"
                    label="Define the collor inversion probability (between 0 and 1)"
                    required
                    maxlength="64"
                    autocomplete="off"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" class="mt-n6">
                  <v-select
                    v-model="entity.inspiration"
                    :items="inspirations"
                    label="Inspiration"
                  ></v-select>
                </v-col>
                <v-col cols="12" class="mt-n6">
                  <v-select
                    v-model="entity.wallType"
                    :items="places"
                    label="Exhibition (you can change it later)"
                  ></v-select>
                </v-col>
                <v-col cols="12" class="mt-n6">
                  PIRS: 5%
                  <br />
                  <small><a href="https://bit.ly/algopainter-pirs" target="_blank">Learn more</a></small>
                </v-col>
                <v-col cols="12" class="mt-n6">
                  <v-btn :disabled="isMinting || entity.text === ''" color="primary" block @click="updateImage">
                    Generate Painting
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>

            <v-card class="pa-3" v-if="!hasAllowance">
              <v-row>
                <v-col cols="12">
                  <v-alert outlined type="info" prominent>
                    You need to approve Gwei smart contract to spend ALGOP.
                  </v-alert>
                </v-col>
                <v-col cols="12" class="mt-n6">
                  <v-btn color="primary" block @click="approve">
                    Approve Gwei
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <v-dialog
      v-model="dialog"
      width="500"
    >
      <v-card>
        <v-card-title>
          {{ this.entity.text }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <paiting-view
                :text="parsedText"
                :inspiration="parsedInspiration"
                :useRandom="parsedUseRandom"
                :probability="parsedProbability"
                :wallType="parsedWallType"
                :ticks="ticks"
              ></paiting-view>
            </v-col>
            <v-col cols="12" class="mt-n4">
              <v-btn x-small color="success" block left @click="updateTicks">
                Reload
              </v-btn>
            </v-col>
            <v-col cols="12" class="mt-n5">
              <v-text-field
                v-model="entity.description"
                :counter="255"
                maxlength="255"
                label="Give a description for your painting"
                required
                autocomplete="off"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="mt-n6">
              <v-alert type="error" prominent>
                <div class="title">
                  {{entity.amount}} $ALGOP
                </div>
                <small>
                  You will pay {{entity.amount}} $ALGOP to mint this amazing job, however
                  this price can change if the batch changes!
                </small>
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
            v-if="!isMinting"
            color="grey"
            text
            @click="clearParameters()"
          >
            Discard this amazing job...
          </v-btn>
          <small v-if="isUploadingToIPFS || isWaitingTransaction">
            <span v-if="isUploadingToIPFS">
              Uploading to IPFS...
            </span>
            <span v-if="isWaitingTransaction">
              Waiting blockchain transaction...
            </span>
          </small>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isMinting"
            color="primary"
            text
            :disabled="!entity.description"
            @click="mint()"
          >
            Mint this job!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import PaitingView from "@/lib/components/ui/PaitingView";

import IPFSHelper from "@/lib/helpers/IPFSHelper";
import AlgoPainterGweiItemProxy from "@/lib/eth/AlgoPainterGweiItemProxy";
import AlgoPainterTokenProxy from "@/lib/eth/AlgoPainterTokenProxy";
import { sha256 } from "js-sha256";

export default {
  components: {
    PaitingView,
  },

  data() {
    return {
      inspirations: [
        {
          text: 'Random',
          value: '0',
        },
        {
          text: 'Calm',
          value: '1',
        },
        {
          text: 'Colorful blocks',
          value: '2',
        },
        {
          text: 'Colorful paths',
          value: '3',
        },
        {
          text: 'Hot flows',
          value: '4',
        },
        {
          text: 'Galaxy',
          value: '5',
        },
        {
          text: 'Madness',
          value: '6',
        },
      ],
      places: [
        {
          text: 'None',
          value: '0',
        },
        {
          text: 'Wall',
          value: '1',
        },
        {
          text: 'Big Wall',
          value: '2',
        },
        {
          text: 'Room',
          value: '6',
        },
        {
          text: 'Bedroom',
          value: '3',
        },
        {
          text: 'High-Tech Gallery',
          value: '4',
        },
        {
          text: 'Open Gallery',
          value: '5',
        },
        {
          text: 'PsyVerse',
          value: '7',
        },
      ],
      ticks: Date.now(),
      isMinting: false,
      isUploadingToIPFS: false,
      isWaitingTransaction: false,
      isMinted: false,
      showUpdate: false,
      dialog: false,
      entity: {
        text: "My Amazing Painting",
        description: "",
        inspiration: "1",
        useRandom: "false",
        probability: 0.5,
        wallType: "1",
      },
      parsedText: "",
      parsedInspiration: "1",
      parsedUseRandom: "true",
      parsedProbability: 0.5,
      parsedWallType: "1",
      errorMsg: undefined,
      minAmount: 0,
      currencyConfig: {
        prefix: "ALGOP",
        suffix: "",
        decimalLength: 2,
        autoDecimalMode: true,
        allowNegative: false,
      },

      hasAllowance: false,
      totalSupply: 0,
      amountToBurn: 0,
    };
  },

  watch: {
    isConnected() {
      this.updateInfo();
    },

    currentBlockNumber() {
      this.updateInfo();
    },
    
    account() {
      this.updateInfo();
    },
  },

  computed: {
    stats() {
      return [{
        icon: 'mdi-wallet',
        color: 'success',
        title: 'Batch Price ($ALGOP)',
        value: this.minAmount
      }, {
        icon: 'mdi-lock-open-variant-outline',
        color: 'green',
        title: 'Remaining',
        value: 1000 - this.totalSupply,
      },{
        icon: 'mdi-lock-outline',
        color: 'primary',
        title: 'Minted',
        value: this.totalSupply
      }, {
        icon: 'mdi-fire',
        color: 'yellow',
        title: 'Tokens to Burn ($ALGOP)',
        value: this.amountToBurn,
      }];
    },

    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
    },

    gweiContractAddress() {
      return this.$store.getters['user/gweiContractAddress'];
    },

    contractAddress() {
      return this.$store.getters['user/contractAddress'];
    },

    currentBlockNumber() {
      return this.$store.getters['user/currentBlockNumber'];
    },

    src() {
      return `${process.env.VUE_APP_GWEI_ENDPOINT}/?width=300&height=300&ticks=${this.ticks}&text=${encodeURIComponent(this.parsedText)}&inspiration=${this.parsedInspiration}&useRandom=${this.parsedUseRandom}&probability=${this.parsedProbability}&wallType=${this.parsedWallType}`;
    },
  },

  mounted() {
    this.clearParameters();
  },

  mounted() {
    this.updateInfo();
  },

  methods: {
    rules() {},

    async mint() {
      try {
        this.isMinted = false;
        this.isMinting = true;
        this.errorMsg = "";
        this.rules();

        const urlImage = this.src;

        // this.isUploadingToIPFS = true;
        // const image = await fetch(urlImage);
        // const imageBuffer = await image.arrayBuffer();
        // const ipfsDataImage = await IPFSHelper.add(imageBuffer);

        const payload = {
          // image: `https://ipfs.io/ipfs/${ipfsDataImage.path}`,
          image: this.src,
          text: this.entity.text,
          inspiration: this.entity.inspiration,
          useRandom: this.entity.useRandom,
          probability: this.entity.probability,
          place: this.entity.wallType,
          description: this.entity.description,
          amount: this.entity.amount,
          mintedBy: this.account,
          createdAt: new Date(),
        }

        console.log({payload});

        const ipfsData = await IPFSHelper.add(JSON.stringify(payload));
        const tokenURI = `https://ipfs.io/ipfs/${ipfsData.path}`;
        this.isUploadingToIPFS = false;

        console.log({tokenURI})

        const amount = this.entity.amount;
        const proxy = new AlgoPainterGweiItemProxy();

        const newMint = {
          text: this.entity.text,
          inspiration: this.entity.inspiration,
          useRandom: this.entity.useRandom,
          probability: this.entity.probability * 10,
          place: this.entity.wallType,
          tokenURI,
          amount,
        };
        this.creating = true;

        this.transactionHash = await proxy.mint(newMint, this.account, (receipt) => {
          this.isWaitingTransaction = false;
          this.receipt = receipt;
          this.isMinting = false;
          this.isMinted = true;
        });
        this.isWaitingTransaction = true;
      } catch (error) {
        console.log(error);
        this.isMinting = false;
        this.isWaitingTransaction = false;
        this.isMinted = false;

        switch (error.code) {
          case 'INVALID_MINIMUM_AMOUNT':
            this.errorMsg =
              'Your payment mast be greater than or equal to the minimum amount';
            break;
          case 'PAINTING_ALREADY_REGISTERED':
            this.errorMsg = 'This painting was already generated for another costumer';
            break;
          case 4001:
            this.errorMsg =
              'MetaMask Tx Signature: User denied transaction signature.';
            break;
          default:
            this.errorMsg = 'Unexpected error';
        }
      } finally {
        this.clearParameters();
      }
    },

    updateTicks() {
      this.ticks = Date.now();
    },

    async updateImage() {
      if (!this.isConnected) {
        return false;
      }

      const proxy = new AlgoPainterGweiItemProxy();

      this.dialog = true;
      this.minAmount = await proxy.getCurrentAmount();
      this.entity.amount = this.minAmount;
      this.showUpdate = true;
      this.isMinted = false;
      this.parsedText = this.entity.text;
      this.parsedInspiration = this.entity.inspiration;
      this.parsedUseRandom = this.entity.useRandom;
      this.parsedProbability = this.entity.probability;
      this.parsedWallType = this.entity.wallType;
    },

    clearParameters() {
      this.isUploadingToIPFS = false;
      this.creating = false;
      this.dialog = false;
      this.showUpdate = false;
      this.parsedText = '';
      this.parsedInspiration = '-1';
      this.parsedUseRandom = 'false';
      this.parsedProbability = 0;
      this.parsedWallType = '1';
    },

    async updateInfo() {
      if (!this.isConnected) {
        return false;
      }

      const algop = new AlgoPainterTokenProxy();
      this.hasAllowance = await algop.hasAllowance(this.account, this.gweiContractAddress);

      const proxy = new AlgoPainterGweiItemProxy();
      this.minAmount = await proxy.getCurrentAmount();

      this.totalSupply = await proxy.getTotalSupply();
      this.amountToBurn = await proxy.getAmountToBurn();
    },

    async approve() {
      const algop = new AlgoPainterTokenProxy();
      await algop.approve(this.account, this.gweiContractAddress); 
    }
  },
};
</script>
