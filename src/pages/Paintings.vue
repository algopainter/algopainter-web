<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-toolbar class="elevation-0">
        <v-toolbar-title>Gallery</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="!isMyPaintings" color="grey" class="mr-4" outlined to="/my-paintings">
          My Paintings
        </v-btn>
         <v-btn v-else color="grey" class="mr-4" outlined to="/">
          <v-icon left>mdi-view-module</v-icon>
          Back to Gallery
        </v-btn>

        <v-btn color="primary" class="mr-4" @click="dialog = true">
          New Painting
          <v-icon right>mdi-file-star-outline</v-icon>
        </v-btn>
      </v-toolbar>
    </v-card>

    <v-tabs v-model="tab">
      <v-tab v-for="collection in collections" :key="collection.id">{{collection.name}}</v-tab>
    </v-tabs>

    <v-divider class="my-2"></v-divider>
    <v-container fluid v-if="isLoading">
      <v-row dense>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid v-else>
      <v-row dense v-if="items.length">
        <v-col
          cols="12"
          md="3"
          :key="item.tokenId"
          v-for="item in items"
        >
          <painting-card :key="item.tokenId" :painting="item" :collection="collection.id" />
        </v-col>
      </v-row>
      <v-row dense v-else>
        <v-col cols="12" md="12">
          <div class="text-center">
            <h1 class="my-3">The gallery is empty!</h1>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <div class="text-center" v-if="pageCount > 1">
      <v-container>
        <v-row justify="center">
          <v-col cols="8">
            <v-container class="max-width">
              <v-pagination
                v-model="page"
                class="my-4"
                :length="pageCount"
              ></v-pagination>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-dialog
      v-model="isError"
      width="500"
    >
      <v-card>
        <v-card-title>
          An error has occurred...
        </v-card-title>
        <v-card-text>
          <v-alert
            prominent
            type="error"
          >
            {{errorMessage}}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="isError = false" color="primary">
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialog"
      width="500"
    >
      <v-card>
        <v-card-title>
          Select an AlgoPainter
        </v-card-title>

        <v-card-text class="d-flex">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-img 
                v-bind="attrs"
                v-on="on" 
                @click="goToNewPainting" 
                src="/images/artists/gwei.png" 
                style="width: 30%; height: 30%; cursor: pointer" 
              />
            </template>
            <span>Gwei</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-img 
                v-bind="attrs"
                v-on="on" 
                @click="goToNewPaintingExpressions" 
                src="/images/artists/manwithnoname.png"
                style="width: 30%; height: 30%; cursor: pointer" 
              />
            </template>
            <span>ManWithNoName</span>
          </v-tooltip>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import CollectionController from '@/lib/controllers/CollectionController';
import AlgoPainterERC721Proxy from '@/lib/eth/AlgoPainterERC721Proxy';
import PaintingCard from '@/lib/components/ui/PaintingCard';

export default {
  components: {
    PaintingCard,
  },

  data() {
    return {
      dialog: false,

      page: 1,
      pageCount: 0,
      pageSize: 8,
      items: [],
      isLoading: true,

      collections: [],
      collection: {},

      isMyPaintings: this.$route.path === '/my-paintings',

      tab: 0,

      isError: false,
      errorMessage: "",
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
  },

  watch: {
    isConnected() {
      this.loadData();
    },

    account() {
      this.loadData();
    },

    page() {
      this.loadData();
    },

    tab() {
      this.page = 1;
      this.loadPaintings();
    }
  },

  mounted() {
    this.loadData();
  },

  methods: {
    goToNewPainting() {
      this.$router.push(`/paintings/new`);
    },

    goToNewPaintingExpressions() {
      this.$router.push(`/collections/1/new`);
    },

    setInitialState() {
      this.isError = false;
      this.errorMessage = "";
      this.items = [];
      this.isLoading = false;
      this.pageCount = 0;
    },

    async loadData() {
      if (!this.isConnected) {
        return;
      }

      this.isLoading = true;

      const collectionController = new CollectionController();
      const collections = await collectionController.getCollections();
      collections.reverse();

      this.collections = collections.map(collection => {
        return {
          id: collection.id,
          name: collection.name,
          contract: {
            address: collection.contract.address,
          },
        };
      });

      await this.loadPaintings();
      this.isLoading = false;
    },

    async loadPaintings(page) {
      if (!this.isConnected) {
        return;
      }

      try {
        this.setInitialState();
        this.isLoading = true;

        this.collection = this.collections[this.tab];
        const contractAddress = this.collection.contract.address[this.networkInfo.id.toString()];

        const erc721 = new AlgoPainterERC721Proxy(this.collection, contractAddress);
        const count = !this.isMyPaintings ? await erc721.getTotalSupply() : await erc721.getBalanceOf(this.account);

        this.page = page || this.page;
        this.pageCount = Math.ceil(count / this.pageSize);

        this.items = await erc721.getItems(this.pageSize, this.page - 1, !this.isMyPaintings ? null : this.account);
        this.isLoading = false;
      } catch (e) {
        this.setInitialState();
        this.isError = true;
        this.errorMessage = `An error has occure while listing items from the collection ${this.collection.name}. Please try again or contact the support!`;
      }
    },
  },
};
</script>
