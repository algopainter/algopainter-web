<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-toolbar class="elevation-0">
        <v-toolbar-title>#{{tokenId}} {{item.name}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="grey" class="mr-4" outlined to="/">
          <v-icon left>mdi-view-module</v-icon>
          Go to Gallery
        </v-btn>

        <v-btn color="primary" class="mr-4" :to="`/collections/${collectionId}/new`">
          New Painting
          <v-icon right>mdi-file-star-outline</v-icon>
        </v-btn>
      </v-toolbar>
    </v-card>
    <v-container>
      <v-row dense align="center" justify="center">
        <v-col cols="12">
          <v-card
            class="d-flex justify-center mb-6"
            :color="$vuetify.theme.dark ? 'grey darken-3' : 'grey lighten-4'"
            flat
            tile
          >
            <v-card
              class="pa-2"
              tile
            >
              <v-img v-show="loaded"
                :width="width" 
                :height="height" 
                :src="item.image" 
                @load="onLoad()"></v-img>
              <v-skeleton-loader
                v-if="!loaded" 
                type="image"
                :width="width" 
                :height="height"
              ></v-skeleton-loader>
              <small><a :href="item.image" download target="_blank">Download the raw painting</a></small>
            </v-card>
          </v-card>
        </v-col>
      </v-row>
     </v-container>
    <v-card class="mt-n6">
      <v-card-title>
        Details
      </v-card-title>
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left" style="width: 150px">
                  Property
                </th>
                <th class="text-left">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Collection</td>
                <td>{{collection.name}}</td>
              </tr>
              <tr>
                <td>Owner</td>
                <td>
                  {{item.owner}}
                </td>
              </tr>
              <tr>
                <td>Description</td>
                <td>
                  {{item.description}}
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
          color="primary"
          text
          :to="`/collections/${collectionId}/new`"
        >
          I want to create a painting like that!
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import AlgoPainterERC721Proxy from '@/lib/eth/AlgoPainterERC721Proxy';
import PaintingCard from '@/lib/components/ui/PaintingCard';
import CollectionController from '@/lib/controllers/CollectionController';

export default {
  components: {
    PaintingCard,
  },

  data() {
    return {
      painting: {
      },
      collection: {
      },   

      item: {},

      collectionId: this.$route.params.id,
      tokenId: this.$route.params.tokenId,

      loaded: false,
    };
  },

  computed: {
    height() {
      return 714;
    },

    width() {
      return 714;
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
  },

  watch: {
    isConnected() {
      this.loadData();
    },

    account() {
      this.loadData();
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadData() {
      if (!this.isConnected) {
        return;
      }

      try {
        this.loading = true;

        const collectionController = new CollectionController();
        this.collection = await collectionController.getCollectionById(parseInt(this.collectionId));
        const contractAddress = this.collection.contract.address[this.networkInfo.id.toString()];
        const erc721 = new AlgoPainterERC721Proxy(this.collection, contractAddress);
        this.item = await erc721.getItem(this.tokenId);

        console.log(this.item);
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },

    onLoad() {
      this.loading = false;
      this.loaded = true;
    }
  },
};
</script>
