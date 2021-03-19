<template>
  <div>
    <v-container>
      <v-card color="grey lighten-4" flat>
        <v-toolbar class="elevation-0">
          <v-toolbar-title>New Paiting</v-toolbar-title>
        </v-toolbar>
      </v-card>
      <v-divider class="my-2"></v-divider>
      <v-container>
        <v-row dense>
          <v-col cols="6">
            <v-card class="pa-3">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="entity.text"
                    :counter="64"
                    label="Give the paiting a name"
                    required
                    autocomplete="off"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="mt-n9">
                  <v-radio-group v-model="entity.useWall" row>
                    <template v-slot:label>
                      <div>Hang the painting on wall </div>
                    </template>
                    <v-radio
                      label="Yes"
                      value="true"
                    ></v-radio>
                    <v-radio
                      label="No"
                      value="false"
                    ></v-radio>
                  </v-radio-group>  
                </v-col>

                <v-col v-if="entity.useWall !== 'true'" cols="12" class="mt-n9">
                  <v-radio-group v-model="entity.createBackgroundMosaic" row>
                    <template v-slot:label>
                      <div>Generate a mosaic background</div>
                    </template>
                    <v-radio
                      label="Yes"
                      value="true"
                    ></v-radio>
                    <v-radio
                      label="No"
                      value="false"
                    ></v-radio>
                  </v-radio-group>  
                </v-col>

                <v-col cols="12" class="mt-n8">
                  <v-radio-group v-model="entity.useRandom" row>
                    <template v-slot:label>
                      <div>Apply random collor inversion</div>
                    </template>
                    <v-radio
                      label="Yes"
                      value="true"
                    ></v-radio>
                    <v-radio
                      label="No"
                      value="false"
                    ></v-radio>
                  </v-radio-group>  
                </v-col>

                <v-col v-if="entity.useRandom === 'true'"  cols="12" class="mt-n6">
                  <v-text-field
                    v-model="entity.probability"
                    :counter="64"
                    label="Define the probability of occurr a random color inversion"
                    required
                    autocomplete="off"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" class="mt-n10">
                  <v-radio-group v-model="entity.inspiration">
                    <template v-slot:label>
                      <div>Inspiration</div>
                    </template>
                    <v-radio
                      label="Random"
                      value="-1"
                    ></v-radio>
                    <v-radio
                      label="Calm"
                      value="1"
                    ></v-radio>
                    <v-radio
                      label="Colorful blocks"
                      value="2"
                    ></v-radio>
                    <v-radio
                      label="Colorful paths"
                      value="3"
                    ></v-radio>
                    <v-radio
                      label="Hot flows"
                      value="4"
                    ></v-radio>
                    <v-radio
                      label="Galaxy"
                      value="5"
                    ></v-radio>
                    <v-radio
                      label="5000 days"
                      value="6"
                    ></v-radio>
                  </v-radio-group>  
                </v-col>
                <v-col cols="12" class="mt-n6"> 
                  <v-currency-field
                    v-model="entity.amount"
                    label="Pay amount"
                    required
                    v-bind="currencyConfig"
                  >
                  </v-currency-field>
                  <div class="ma-0 mt-n2 orange--text">
                    Minimum suggested amount: {{ minAmount }}
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="6" class="text-center">
            <v-row>
              <v-col
                cols="12"
              >
                <v-btn
                  color="primary"
                  @click="updateImage"
                >
                  <span v-if="showUpdate">Update Paiting</span>
                  <span v-else>Generate Paiting</span>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col
                cols="12"
                v-if="parsedText !== ''"
                class="mt-n3"
              >
                <paiting-view 
                  :text="parsedText" 
                  :createBackgroundMosaic="parsedCreateBackgroundMosaic" 
                  :inspiration="parsedInspiration"
                  :useWall="parsedUseWall"
                  :useRandom="parsedUseRandom"
                  :probability="parsedProbability"
                  ></paiting-view>
              </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="entity.description"
                    :counter="255"
                    label="In a few words describe your feelings about this paiting"
                    required
                    autocomplete="off"
                  ></v-text-field>
                </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <v-alert v-if="errorMsg" outlined type="error" prominent>
              {{ errorMsg }}
            </v-alert>
            <v-alert v-if="successRobot" outlined type="success" prominent>
              Your amazing painting has been successfully minted!
            </v-alert>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="12" class="text-right">
            <v-btn
              color="primary"
              class="mr-4"
              @click="mintRobot"
            >
              Mint your unique paiting
              <v-icon right>mdi-file-star-outline</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </div>
</template>

<script>
import config from "@/configs";

import PaitingView from "@/lib/components/ui/PaitingView";

import IPFSHelper from "@/lib/helpers/IPFSHelper";
import AlgoPainterGweiItemProxy from "@/lib/eth/AlgoPainterGweiItemProxy";
import { sha256 } from 'js-sha256';


export default {
  components: {
    PaitingView,
  },

  data() {
    return {
      showUpdate: false,
      entity: {
        text: 'My Amazing Paiting',
        description: '',
        createBackgroundMosaic: 'true',
        inspiration: '-1',
        useWall: 'true',
        useRandom: 'false',
        probability: 0.5,
      },
      parsedText: '',
      parsedCreateBackgroundMosaic: 'false',
      parsedInspiration: '1',
      parsedUseWall: 'true',
      parsedUseRandom: 'true',
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
      successRobot: false,
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
      return `http://digital-artist-gwei.herokuapp.com/?text=${this.parsedText}&createBackgroundMosaic=${this.parsedCreateBackgroundMosaic}&inspiration=${this.parsedInspiration}&useWall=${this.parsedUseWall}&useRandom=${this.parsedUseRandom}&probability=${this.parsedProbability}`;
    }
  },

  mounted() {
  },

  methods: {
    rulesMintRobot() {
      
    },

    async mintRobot() {
      try {
        this.errorMsg = "";
        this.rulesMintRobot();
        
        const payload = JSON.stringify({
          name: this.entity.text,
          description: this.entity.description,
          image: this.src,
          createBackgroundMosaic: this.entity.createBackgroundMosaic,
          inspiration: this.entity.inspiration,
          useWall: this.entity.useWall,
          useRandom: this.entity.useRandom,
          probability: this.entity.probability,
        });
        const hash = '0x' + sha256(payload);

        const ipfsData = await IPFSHelper.add(payload);
        const tokenURI = `https://ipfs.io/ipfs/${ipfsData.path}`;

        const amount = this.entity.amount;
        const proxy = new AlgoPainterGweiItemProxy();

        const signature = '0x0';

        const newMint = {
          hash,
          tokenURI,
          signature,
          amount,
        };

        console.log(JSON.stringify(newMint));

        this.creating = true;

        this.transactionHash = await proxy.mint(newMint, this.account);
        this.successRobot = true;
      } catch (error) {
        console.log(error);
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
        this.creating = false;
      }
    },

    showHexValue(item) {
      return HexHelper.get32BytesHexValue(item.type, item.value);
    },

    copyCurrentBlock() {
      this.entity.blockLimit = parseInt(this.currentBlockNumber);
    },

    closeTokenDialog() {
      this.tokenDialog = false;
    },

    deleteOption(item) {
      this.entity.options = this.entity.options.filter((o) => o !== item);
    },

    deleteInputData(item) {
      this.entity.data = this.entity.data.filter((o) => o !== item);
    },

    async updateImage() {
      this.showUpdate = true;
      this.parsedText = this.entity.text;
      this.parsedCreateBackgroundMosaic = this.entity.createBackgroundMosaic;
      this.parsedInspiration = this.entity.inspiration;
      this.parsedUseWall = this.entity.useWall;
      this.parsedUseRandom = this.entity.useRandom;
      this.parsedProbability = this.entity.probability;
    },
  },
};
</script>
