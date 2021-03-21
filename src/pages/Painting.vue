<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-toolbar class="elevation-0">
        <v-toolbar-title>#{{tokenId}} {{painting.name}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="grey" class="mr-4" outlined to="/">
          <v-icon left>mdi-view-module</v-icon>
          Go to Gallery
        </v-btn>

        <v-btn color="primary" class="mr-4" to="/paintings/new">
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
              <v-img width="714" height="714" :src="painting.image"></v-img>
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
                <td>AlgoPainter</td>
                <td>Hashley Gwei</td>
              </tr>
              <tr>
                <td>Owner</td>
                <td>
                  {{painting.owner}}
                </td>
              </tr>
              <tr>
                <td>Description</td>
                <td>
                  {{painting.description}}
                </td>
              </tr>
              <tr>
                <td>Parameters</td>
                <td>
                  <div>
                    Hang the painting on wall: 
                    <b>{{painting.useWall === 'true' ? 'Yes': 'No'}}</b>
                  </div>
                  <div v-if="painting.useWall === 'false'">
                    Generate a mosaic background: 
                    <b>{{painting.createBackgroundMosaic === 'true' ? 'Yes': 'No'}}</b>
                  </div>
                  <div>
                    Apply random color inversion: 
                    <b>{{painting.useRandom === 'true' ? 'Yes': 'No'}}</b>
                  </div>
                  <div>
                    Define the collor inversion probability: 
                    <b>{{painting.probability}}</b>
                  </div>
                  <div>
                    Inspiration: 
                    <b>{{parsedInspiration}}</b>
                  </div>
                  <div>
                    Created By: 
                    <b>{{painting.mintedBy}}</b>
                  </div>
                  <div>
                    Minted by <b>{{painting.amount}}</b> ETH
                  </div>
                  <div>
                    Minted: 
                    <b>{{painting.createdAt}}</b>
                  </div>
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
          to="/paintings/new"
        >
          I want to create a painting like that!
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-container fluid v-if="loading">
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
  </div>
</template>

<script>
import AlgoPainterGweiItemProxy from '@/lib/eth/AlgoPainterGweiItemProxy';
import PaintingCard from '@/lib/components/ui/PaintingCard';

export default {
  components: {
    PaintingCard,
  },

  data() {
    return {
      painting: {

      },
      paintings: [],
      loading: true,
      tokenId: this.$route.params.tokenId
    };
  },

  computed: {
    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
    },

    parsedInspiration() {
      switch(this.painting.inspiration) {
        case '-1':
          return 'Random';
        case '1':
          return 'Calm';
        case '2':
          return 'Colorful blocks';
        case '3':
          return 'Colorful paths';
        case '4':
          return 'Hot flows';
        case '5':
          return 'Galaxy';
        case '6':
          return '5000 days';
        
      }
    }
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

      this.loading = true;

      try {
        const apProxy = new AlgoPainterGweiItemProxy();
        const paintingResponse = await apProxy.getPainting(this.tokenId);
        this.painting = paintingResponse.response;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
