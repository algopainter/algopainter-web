<template>
  <div>
    <v-container>
      <v-row dense>
        <v-col
          v-for="(stat, i) in stats"
          :key="i"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="pa-3 text-center">
            <div @click="showPricing(stat)" :class="{clickable: stat.showPricing}">
              <div class="overline mb-2">
                <v-icon :color="stat.color">{{stat.icon}}</v-icon>
                {{ stat.title }}
              </div>
              <div class="text-h4">{{ stat.value }}</div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-container>
      <v-card color="grey lighten-4" flat>
        <v-toolbar class="elevation-0">
          <v-toolbar-title>New Painting from {{ collection.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn v-if="isMinted" color="grey" class="mr-4" outlined to="/">
            <v-icon left>mdi-view-module</v-icon>
            Back to Gallery
          </v-btn>
        </v-toolbar>
      </v-card>
      <v-divider class="my-2"></v-divider>
      <v-alert type="error" v-if="!account">You are not connected! Please check in your wallet.</v-alert>
      <v-container v-if="collection.id">
        <v-row dense>
          <v-col lg="6" sm="12">
            <v-card>
              <v-card-title>Parameters</v-card-title>
              <v-card-text>
                <v-row class="mt-n1" style="max-height: 630px; overflow: auto">
                  <v-col cols="12" :class="{'mt-n8': index > 0}" v-for="(parameter, index) in collection.parameters" :key="parameter.name">
                    <div v-if="parameter.widget === 'select'">
                      <v-select
                        v-model="paintingInfo[parameter.name]"
                        :items="parameter.items"
                        :label="parameter.displayName"
                      ></v-select>
                    </div>

                    <div class="mt-n1" v-if="parameter.widget === 'slider'">
                      <v-subheader class="pl-0">
                        {{parameter.displayName}}
                      </v-subheader>
                      <v-slider
                        v-model="paintingInfo[parameter.name]"
                        hint="Im a hint"
                        :max="parameter.maxValue"
                        :min="parameter.minValue"
                      ></v-slider>
                    </div>

                    <div class="mt-n2" v-if="parameter.widget === 'checkbox'">
                      <v-checkbox
                        v-model="paintingInfo[parameter.name]"
                        :label="parameter.displayName"
                      ></v-checkbox>
                    </div>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="">
                    <v-btn color="primary" :disabled="isLoading" block @click="generatePreview">
                      Generate Preview
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col lg="6" sm="12">
            <v-card>
              <v-card-title>Painting</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" class="d-flex justify-center">
                    <img :class="{blur: isLoading}" width="400" height="400" v-bind:src="encodedImage" />
                  </v-col>
                </v-row>
                <v-row class="mt-n3">
                  <v-col cols="12">
                    <v-text-field
                      v-model="name"
                      :counter="50"
                      maxlength="50"
                      label="Give a name for your artwork"
                      required
                      autocomplete="off"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="mt-n8">
                    <v-text-field
                      v-model="description"
                      :counter="255"
                      maxlength="255"
                      label="Give a description for your artwork"
                      required
                      autocomplete="off"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="mt-n4">
                    <v-checkbox
                      class="mt-n2"
                      v-model="isFeeWarningOk"
                      :label="displayFeeMessage"
                    ></v-checkbox>
                    <!-- <div class="mt-n1"><small>Click <a href="" target="_blank">here</a> to learn more fees</small></div> -->
                  </v-col>
                </v-row>
                <v-row v-if="isError">
                  <v-col cols="12">
                    <v-alert
                      outlined 
                      type="error" 
                      class="mt-n4" 
                      prominent 
                    >
                    {{errorMessage}}
                  </v-alert>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  color="primary"
                  :disabled="!loaded || !name || !description || !isFeeWarningOk"
                  text
                  :disable="!account"
                  :loading="isMinting"
                  @click="startMintingProcess"
                >
                  Mint this artwork
                </v-btn>
              </v-card-actions>
              <v-overlay
                :absolute="true"
                :value="isLoading"
              >
                <v-progress-circular
                  indeterminate
                  color="amber"
                ></v-progress-circular>
              </v-overlay>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <v-dialog
      v-model="dialog"
      :persistent="(step === 3 || step === 4) && !this.isMinted"
      width="500"
    >
      <v-card>
        <v-card-title>
          Minting your Expression ({{name}})
        </v-card-title>
        <v-card-text class="d-flex flex-column justify-space-between align-center">
          {{description}}

          <v-progress-circular
            :rotate="360"
            :size="100"
            :width="15"
            :value="step * progress"
            color="primary"
            class="mt-1"
          >
            <span v-if="step <= 4">{{step + 1}} of 5</span>
            <span v-else>Done</span>
          </v-progress-circular>
          <v-alert v-if="step !== 3"
              icon="mdi-information" 
              outlined 
              type="primary" 
              class="mt-2" 
              prominent 
              style="width: 100%"
            >
            <span v-if="step === 0">Generating the <strong>preview</strong> file...</span>
            <span v-if="step === 1">Generating the <strong>raw</strong> file (it may take a while)...</span>
            <span v-if="step === 2">Generating the <strong>descriptor</strong> file...</span>
            <span v-if="step === 4 || step === 5">
              <span v-if="isWaitingWalletApproval">Waiting for the wallet approval...</span>
              <span v-if="isWaitingBlockchainConfirmation">It is done, now wait for the first blockchain confirmation...</span>
              <span v-if="isMinted">Your amazing artwork was minted successfully. Check out your gallery!</span>
            </span>
            <v-progress-linear
              :active="!isMinted"
              :indeterminate="true"
              absolute
              bottom
              color="primary"
            ></v-progress-linear>
          </v-alert>
          <div v-if="step === 3">
            <div class="mt-2">
              <a :href="`https://ipfs.io/ipfs/${this.rawIPFSHash}`" target="_blank" class="mt-2">
                Click here to see the raw image (high resolution) file
              </a>
            </div>
            <v-checkbox
              v-model="isRawFileWarningOk"
              label="I have checked the raw file and it is exactly what I want!"
            ></v-checkbox>
            <v-checkbox
              class="mt-n2"
              v-model="isBackupWarningOk"
              label="I downloaded the raw file and saved a backup version of the generated image!"
            ></v-checkbox>
            <v-checkbox
              class="mt-n2"
              v-model="isFeeWarningOk"
              :label="displayFeeMessage"
            ></v-checkbox>
            <v-btn color="primary" :disabled="!isRawFileWarningOk || !isBackupWarningOk || !isFeeWarningOk" block @click="mintNFT">
              Finish the process
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog 
      v-model="isPricingOpen"
      width="500"
    >
      <v-card>
        <v-card-title>
          Pricing table for {{collection.name}}
        </v-card-title>
        <v-card-text>
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    Range
                  </th>
                  <th class="text-left">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(range, index) in collection.pricing.ranges" :key="index">
                  <td>
                    {{range.start}} - {{range.finish}}
                  </td>
                  <td>
                    <div>
                      {{range.price}}
                      {{collection.baseToken}}
                      <small>+ {{formattedServiceFee}}% of service fee</small>
                    </div>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { paint } from '@/workers/painting.worker';
import CollectionController from '@/lib/controllers/CollectionController';
import PinningServiceHelper from "@/lib/helpers/PinningServiceHelper";

export default {
  components: {
  },

  data() {
    return {
      collection: {
        baseToken: "",
        artist: {},
        parameters: [],
      },

      paintingInfo: {},
      encodedImage: "",
      isLoading: false,
      loaded: false,
      isConfigured: false,
      isMinted: false,
      isMinting: false,
      availableSupply: 0,
      currentAmount: 0,
      formattedCurrentAmount: 0,
      formattedServiceFee: 0,
      isError: false,
      errorMessage: "",

      dialog: false,
      progress: 20,
      step: 0,
      previewIPFSHash: "",
      rawIPFSHash: "",
      descriptorIPFSHash: "",
      isBackupWarningOk: false,
      isRawFileWarningOk: false,
      isWaitingWalletApproval: false,
      isWaitingBlockchainConfirmation: false,

      name: "",
      description: "",
      isFeeWarningOk: false,

      isPricingOpen: false,
    };
  },

  watch: {
    isConnected() {
      this.loadData();
    },

    currentBlockNumber() {
      this.loadData();
    },
    
    account() {
      this.loadData();
    },
  },

  computed: {
    stats() {
      return [{
        icon: 'mdi-wallet',
        color: 'success',
        title: `Batch Price`,
        value: this.displayCurrentAmount,
        showPricing: true,
      }, {
        icon: 'mdi-lock-open-variant-outline',
        color: 'green',
        title: 'Remaining',
        value: this.availableSupply,
      },{
        icon: 'mdi-lock-outline',
        color: 'primary',
        title: 'Minted',
        value: this.totalSupply
      }];
    },

    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
    },

    networkInfo() {
      return this.$store.getters["user/networkInfo"];
    },

    currentBlockNumber() {
      return this.$store.getters['user/currentBlockNumber'];
    },

    previewUrl() {
      return this.parseUrl(this.collection.previewUrl);
    },

    rawUrl() {
      return this.parseUrl(this.collection.rawUrl);
    },

    displayCurrentAmount() {
      return `${this.formattedCurrentAmount} ${this.collection.baseToken}`;
    },

    displayFeeMessage() {
      return `I accept to pay ${this.displayCurrentAmount}, including ${this.formattedServiceFee}% of service fee to mint this artwork`;
    },

    intParameters() {
      const params = [];

      for(const parameter of this.collection.parameters) {
        switch(parameter.type.toLowerCase()) {
          case "number":
          case "string":
            if (parameter.items) {
              const selectedItem = parameter.items.find(item => item.value.toString() === this.paintingInfo[parameter.name].toString());
              if (selectedItem.intValue || selectedItem.intValue === 0) {
                params.push(selectedItem.intValue);
              } else {
                params.push(parseInt(this.paintingInfo[parameter.name]));
              }
            } else {
              params.push(this.paintingInfo[parameter.name]);
            }
            break;
          case "bool": 
            if (this.paintingInfo[parameter.name]) {
              params.push(1);
            } else {
              params.push(0);
            }
            break
          default:
            params.push(parseInt(this.paintingInfo[parameter.name]));
        }
      }

      return params;
    }
  },

  mounted() {
    this.loadData();
  },

  methods: {
    parseUrl(originalUrl) {
      let url = new String(originalUrl);

      for(const parameter of this.collection.parameters) {
        const key = '${' + parameter.name + '}';
        let value = this.paintingInfo[parameter.name];
        
        if (value === null || value === undefined) {
          value = parameter.defaultValue;
        } 

        url = url.replace(key, value);
      }

      return url;
    },

    setFormInitialState() {
      this.isError = false;
      this.errorMessage = "";
      this.isConfigured = true;
      this.encodedImage = this.collection.artist.avatar;
      const parsedPaintingInfo = {};

      for (const parameter of this.collection.parameters) {
        parsedPaintingInfo[parameter.name] = parameter.defaultValue;
      }

      this.paintingInfo = Object.assign({}, parsedPaintingInfo);
    },

    async loadData() {
      if (!this.$route.params.id || !this.isConnected) {
        return;
      }

      const collectionController = new CollectionController();

      this.collection = await collectionController.getCollectionById(parseInt(this.$route.params.id));
      this.availableSupply = await collectionController.getAvailableSupply(this.networkInfo, this.collection.id);
      this.totalSupply = await collectionController.getTotalSupply(this.networkInfo, this.collection.id);
      this.currentAmount = await collectionController.getCurrentAmount(this.networkInfo, this.collection.id);
      this.formattedCurrentAmount = await collectionController.getFormattedCurrentAmount(this.networkInfo, this.collection.id);
      this.formattedServiceFee = await collectionController.getFormattedServiceFee(this.networkInfo, this.collection.id);
      
      if (!this.isConfigured) {
        this.setFormInitialState();
      }
    },

    setModalInitialState() {
      this.dialog = false;
      this.step = 0;
      this.previewIPFSHash = "";
      this.rawIPFSHash = "";
      this.descriptorIPFSHash = "";
      this.isBackupWarningOk = false;
      this.isRawFileWarningOk = false;
      this.isWaitingWalletApproval = false;
      this.isWaitingBlockchainConfirmation = false;
      this.isError = false;
      this.isMinting = false;
    },

    async startMintingProcess() {
      try {
        const collectionController = new CollectionController();
        const mint = await collectionController.getMintMethod(this.networkInfo, this.collection.id);

        this.setModalInitialState();

        this.isMinting = true;

        try {
          await mint(this.intParameters, this.currentAmount, "").call({
            value: this.currentAmount,
            from: this.account,
          });
        } catch (e) {
          this.setModalInitialState();

          this.isError = true;

          if (e.message && e.message.indexOf('ALREADY_REGISTERED') >= 0) {
            this.errorMessage = "Another user has minted an artwork using this configuration, please select other set of parameters.";
            return;
          }

          if (e.message && e.message.indexOf('PRICE_HAS_CHANGED') >= 0) {
            this.errorMessage = "The current price has changed, please update the page!";
            return;
          }

          if (e.message && e.message.indexOf('INVALID_AMOUNT') >= 0) {
            this.errorMessage = "Invalid amount!";
            return;
          }

          this.errorMessage = `An unexpected error has occurred, please try again! \n\n ${e.message}`;
          return;
        }

        this.dialog = true;
        
        this.step = 0;
        const previewPiningResult = await PinningServiceHelper.pinFile(`${this.collection.name} - Preview`, this.collection.id, this.previewUrl);
        this.previewIPFSHash = previewPiningResult.ipfsHash;

        if (!this.previewIPFSHash) {
          this.setModalInitialState();
          this.isError = true;
          this.errorMessage = "An error has occured while generating preview file!";
          return;
        }
        
        this.step = 1;
        const rawPiningResult = await PinningServiceHelper.pinFile(`${this.collection.name} - Raw`, this.collection.id, this.rawUrl);
        this.rawIPFSHash = rawPiningResult.ipfsHash;

        if (!this.rawIPFSHash) {
          this.setModalInitialState();
          this.isError = true;
          this.errorMessage = "An error has occured while generating raw file!";
          return;
        }
        
        this.step = 2;
        const payload = {
          name: this.name,
          description: this.description,
          image: `https://ipfs.io/ipfs/${this.rawIPFSHash}`,
          previewImage: `https://ipfs.io/ipfs/${this.previewIPFSHash}`,
          collection: {
            id: this.collection.id,
            name: this.collection.name,
          },
          parameters: this.paintingInfo,
          mintedBy: this.account,
        };
        const descriptorPinningResult = await PinningServiceHelper.pinJSON(payload);
        this.descriptorIPFSHash = descriptorPinningResult.ipfsHash;

        if (!this.descriptorIPFSHash) {
          this.setModalInitialState();
          this.isError = true;
          this.errorMessage = "An error has occured while generating descriptor file!";
          return;
        }

        this.step = 3;
      } catch (e) {
        console.log(e);
        this.setModalInitialState();
      }
    },

    async mintNFT() {
      try {
        const collectionController = new CollectionController();
        this.step = 4;
        const mint = await collectionController.getMintMethod(this.networkInfo, this.collection.id);

        this.isWaitingWalletApproval = true;
        const result = mint(this.intParameters, this.currentAmount, this.descriptorIPFSHash).send({
          value: this.currentAmount,
          from: this.account
        });

        result.on("error", (error) => {
          this.setModalInitialState();
          console.log(error);
          this.isError = true;
          this.errorMessage = `An unexpected error has occurred, please try again! \n\n ${error}`;
        })

        result.on("transactionHash", () => {
          this.step = 5;
          this.isMinting = false;
          this.isWaitingWalletApproval = false;
          this.isWaitingBlockchainConfirmation = true;
        });

        result.on("confirmation", () => {
          this.isMinted = true;
          this.isMinting = false;
          this.isWaitingWalletApproval = false;
          this.isWaitingBlockchainConfirmation = false;

          this.setFormInitialState();
        });
      } catch (e) {
        this.setModalInitialState();
        console.log(e);
        this.isError = true;

        if (e.code === 4001) {
          this.isError = false;
        } else {
          this.errorMessage = `An unexpected error has occurred, please try again! \n\n ${e.message}`;
        }
      }
    },

    async generatePreview() {
      this.isError = false;
      this.isLoading = true;
      this.encodedImage = await paint(this.collection, this.paintingInfo, false);
      this.isLoading = false;
      this.loaded = true;
    },

    showPricing(stat) {
      if (stat.showPricing) {
        this.isPricingOpen = true;
      }
    }
  }
};
</script>

<style scoped>
  .blur {
    -webkit-filter: blur(5px); /* Safari 6.0 - 9.0 */
    filter: blur(5px);
  }

  .v-alert__content {
    overflow: auto;
  }

  .clickable {
    cursor: pointer;
  }
</style>
