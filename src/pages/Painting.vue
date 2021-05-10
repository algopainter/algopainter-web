<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-toolbar class="elevation-0">
        <v-toolbar-title>#{{tokenId}} {{painting.text}}</v-toolbar-title>
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
              <v-img v-show="loaded"
                :width="width" 
                :height="height" 
                :src="src" 
                @load="onLoad()"></v-img>
              <v-skeleton-loader
                v-if="!loaded" 
                type="image"
                :width="width" 
                :height="height"
              ></v-skeleton-loader>
              
              <small v-if="loaded"><a :href="raw" download target="_blank">Download the raw painting</a></small>
              <v-select
                v-model="innerPlace"
                :items="places"
                label="Do you want to see in other environment?"
              ></v-select>
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
                    Text: 
                    <b>{{painting.text}}</b>
                  </div>
                  <div>
                    Apply random color inversion: 
                    <b>{{painting.useRandom === 'true' ? 'Yes': 'No'}}</b>
                  </div>
                  <div v-if="painting.useRandom === 'true'">
                    Define the collor inversion probability: 
                    <b>{{painting.probability}}</b>
                  </div>
                  <div>
                    Inspiration: 
                    <b>{{parsedInspiration}}</b>
                  </div>
                  <div>
                    Exhibition: 
                    <b>{{parsedPlace}}</b>
                  </div>
                  <div>
                    Created By: 
                    <b>{{painting.mintedBy}}</b>
                  </div>
                  <div>
                    Minted for <b>{{painting.amount}}</b> $ALGOP
                  </div>
                  <div>
                    Minted at: 
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
      innerPlace: '',
      paintings: [],
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
      loading: true,
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

    src() {
      return `${process.env.VUE_APP_GWEI_ENDPOINT}/?text=${encodeURIComponent(this.painting.text)}&inspiration=${this.painting.inspiration}&useRandom=${this.painting.useRandom}&probability=${this.painting.probability}&wallType=${this.place}`;
    },

    raw() {
      return `${process.env.VUE_APP_GWEI_ENDPOINT}/?text=${encodeURIComponent(this.painting.text)}&inspiration=${this.painting.inspiration}&useRandom=${this.painting.useRandom}&probability=${this.painting.probability}&wallType=0`;
    },

    place() {
      return this.innerPlace || this.painting.place;
    },

    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
    },

    parsedInspiration() {
      switch(this.painting.inspiration) {
        case '0':
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
    },

    parsedPlace() {
      switch(this.painting.place) {
        case '0':
          return 'None';
        case '1':
          return 'Wall';
        case '2':
          return 'Big Wall';
        case '3':
          return 'Bedroom';
        case '4':
          return 'High-Tech Gallery';
        case '5':
          return 'Open Gallery';
        case '6':
          return 'Room';
        case '7':
          return 'PsyVerse';
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

    place() {
      this.loading = true;
      this.loaded = false;
    }
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

    onLoad() {
      console.log(1)
      this.loading = false;
      this.loaded = true;
    }
  },
};
</script>
