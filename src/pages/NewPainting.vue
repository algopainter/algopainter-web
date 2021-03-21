<template>
  <div>
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
          <v-col cols="6">
            <v-img
              class="mx-auto"
              width="300"
              src="/images/project/gwei.png"
            ></v-img>
          </v-col>
          <v-col cols="6">
            <v-card class="pa-3">
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
                <v-col cols="12" class="mt-n9">
                  <v-radio-group v-model="entity.useWall" row>
                    <template v-slot:label>
                      <div>Hang the painting on wall</div>
                    </template>
                    <v-radio label="Yes" value="true"></v-radio>
                    <v-radio label="No" value="false"></v-radio>
                  </v-radio-group>
                </v-col>

                <v-col v-if="entity.useWall !== 'true'" cols="12" class="mt-n9">
                  <v-radio-group v-model="entity.createBackgroundMosaic" row>
                    <template v-slot:label>
                      <div>Generate a mosaic background</div>
                    </template>
                    <v-radio label="Yes" value="true"></v-radio>
                    <v-radio label="No" value="false"></v-radio>
                  </v-radio-group>
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
                    label="Define the collor inversion probability"
                    required
                    autocomplete="off"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" class="mt-n10">
                  <v-radio-group v-model="entity.inspiration">
                    <template v-slot:label>
                      <div>Inspiration</div>
                    </template>
                    <v-radio label="Random" value="-1"></v-radio>
                    <v-radio label="Calm" value="1"></v-radio>
                    <v-radio label="Colorful blocks" value="2"></v-radio>
                    <v-radio label="Colorful paths" value="3"></v-radio>
                    <v-radio label="Hot flows" value="4"></v-radio>
                    <v-radio label="Galaxy" value="5"></v-radio>
                    <v-radio label="5000 days" value="6"></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12" class="mt-n6">
                  <v-btn :disabled="isMinting" color="primary" block @click="updateImage">
                    Generate Painting
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
                :createBackgroundMosaic="parsedCreateBackgroundMosaic"
                :inspiration="parsedInspiration"
                :useWall="parsedUseWall"
                :useRandom="parsedUseRandom"
                :probability="parsedProbability"
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
                label="Give a description for this painting"
                required
                autocomplete="off"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="mt-n6">
              <v-currency-field
                v-model="entity.amount"
                label="How much you will pay for my job?"
                required
                v-bind="currencyConfig"
              >
              </v-currency-field>
              <div class="ma-0 mt-n2 orange--text">
                <small>
                  Minimum amount: {{ minAmount }}
                </small>
              </div>
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
import { sha256 } from "js-sha256";

export default {
  components: {
    PaitingView,
  },

  data() {
    return {
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
        createBackgroundMosaic: "true",
        inspiration: "-1",
        useWall: "true",
        useRandom: "false",
        probability: 0.5,
      },
      parsedText: "",
      parsedCreateBackgroundMosaic: "false",
      parsedInspiration: "1",
      parsedUseWall: "true",
      parsedUseRandom: "true",
      parsedProbability: 0.5,
      errorMsg: undefined,
      minAmount: 0,
      currencyConfig: {
        prefix: "ETH",
        suffix: "",
        decimalLength: 2,
        autoDecimalMode: true,
        allowNegative: false,
      },
    };
  },

  watch: {
    isConnected() {
    },
  },

  computed: {
    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
    },

    src() {
      return `https://ms-algopainter-gwei.herokuapp.com/?text=${this.parsedText}&createBackgroundMosaic=${this.parsedCreateBackgroundMosaic}&inspiration=${this.parsedInspiration}&useWall=${this.parsedUseWall}&useRandom=${this.parsedUseRandom}&probability=${this.parsedProbability}`;
    },
  },

  mounted() {
    this.clearParameters();
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

        this.isUploadingToIPFS = true;
        const image = await fetch(urlImage);
        const imageBuffer = await image.arrayBuffer();
        const ipfsDataImage = await IPFSHelper.add(imageBuffer);

        const baseObject = {
          name: this.entity.text,
          image: `https://ipfs.io/ipfs/${ipfsDataImage.path}`,
          createBackgroundMosaic: this.entity.createBackgroundMosaic,
          inspiration: this.entity.inspiration,
          useWall: this.entity.useWall,
          useRandom: this.entity.useRandom,
          probability: this.entity.probability
        };
        const hash = "0x" + sha256(JSON.stringify(baseObject));

        const payload = {
          ...baseObject,
          hash,
          description: this.entity.description,
          amount: this.entity.amount,
          mintedBy: this.account,
          createdAt: new Date(),
        }

        const ipfsData = await IPFSHelper.add(JSON.stringify(payload));
        const tokenURI = `https://ipfs.io/ipfs/${ipfsData.path}`;
        this.isUploadingToIPFS = false;

        const amount = this.entity.amount;
        const proxy = new AlgoPainterGweiItemProxy();

        const signature = "0x0";

        const newMint = {
          hash,
          tokenURI,
          signature,
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
        this.isMinting = false;
        this.isWaitingTransaction = false;
        this.isMinted = false;

        switch (error.code) {
          case "INVALID_MIN_AMOUNT":
            this.errorMsg =
              "Pay amount must be greater than or equal to the suggested amount";
            break;
          case "NAME_REGISTERED":
            this.errorMsg = "The name is already in use";
            break;
          case "INVALID_NAME":
            this.errorMsg = "The name invalid";
            break;
          case "INVALID_NAME_LENGTH":
            this.errorMsg = "Number of characters not allowed";
            break;
          case 4001:
            this.errorMsg =
              "MetaMask Tx Signature: User denied transaction signature.";
            break;
          default:
            this.errorMsg = "Unexpected error";
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
      this.minAmount = await proxy.getMinimumAmount();
      this.entity.amount = this.minAmount;
      this.showUpdate = true;
      this.isMinted = false;
      this.parsedText = this.entity.text;
      this.parsedCreateBackgroundMosaic = this.entity.createBackgroundMosaic;
      this.parsedInspiration = this.entity.inspiration;
      this.parsedUseWall = this.entity.useWall;
      this.parsedUseRandom = this.entity.useRandom;
      this.parsedProbability = this.entity.probability;
    },

    clearParameters() {
      this.isUploadingToIPFS = false;
      this.creating = false;
      this.dialog = false;
      this.showUpdate = false;
      this.parsedText = '';
      this.parsedCreateBackgroundMosaic = 'true';
      this.parsedInspiration = '-1';
      this.parsedUseWall = 'true';
      this.parsedUseRandom = 'false';
      this.parsedProbability = 0;
    }
  },
};
</script>
