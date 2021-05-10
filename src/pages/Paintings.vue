<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-toolbar class="elevation-0">
        <v-toolbar-title>Gallery</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="grey" class="mr-4" outlined to="/my-paintings">
          My Paintings
        </v-btn>

        <v-btn color="primary" class="mr-4" @click="goToNewPainting()">
          New Painting
          <v-icon right>mdi-file-star-outline</v-icon>
        </v-btn>
      </v-toolbar>
    </v-card>

    <v-divider class="my-2"></v-divider>

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
    <v-container fluid v-else>
      <v-row dense v-if="paintings.length">
        <v-col
          cols="12"
          md="3"
          :key="painting.response.tokenId"
          v-for="painting in paintings"
        >
          <painting-card :key="painting.response.tokenId" :painting="painting" />
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
      page: 1,
      pageCount: 0,
      pageSize: 16,
      paintings: [],
      loading: true,
    };
  },

  computed: {
    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
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
  },

  mounted() {
    this.loadData();
  },

  methods: {
    goToNewPainting() {
      this.$router.push(`/paintings/new`);
    },

    async loadData() {
      if (!this.isConnected) {
        return;
      }

      this.loading = true;

      try {
        await Promise.all([this.loadPaintings()]);
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },

    async loadPaintings(page) {
      if (!this.isConnected) {
        return;
      }

      const apProxy = new AlgoPainterGweiItemProxy();
      const count = await apProxy.getPaintingsCount();

      this.page = page || this.page;
      this.pageCount = Math.ceil(count / this.pageSize);

      const paintings = await apProxy.getPaintings(this.pageSize, this.page - 1);

      this.paintings = paintings.filter((painting) => painting.status === 200);
    },
  },
};
</script>
