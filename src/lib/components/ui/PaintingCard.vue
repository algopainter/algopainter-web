<template>
  <v-card class="mx-auto" min-height="250">
    <v-card-title>
        <div 
        class="d-inline-block text-truncate"
        style="max-width: 250px;">
        #{{ painting.tokenId }}
        {{ painting.text || painting.name }}
        </div>
    </v-card-title>

    <v-img height="300" :src="src"></v-img>
    <v-card-text>
        <small class="d-inline-block text-truncate"
        style="max-width: 250px;">
        {{ painting.description }}
        </small>
    </v-card-text>

    <v-divider></v-divider>
        <div class="d-flex">
          <v-btn v-if="!collection" :to="`/paintings/${painting.tokenId}`" class="flex-grow-1" tile height="48" text>
            <v-icon left>mdi-share-all</v-icon>
            View
          </v-btn>
          <v-btn v-else :to="`/collections/${collection}/${painting.tokenId}`" class="flex-grow-1" tile height="48" text>
            <v-icon left>mdi-share-all</v-icon>
            View
          </v-btn>
        </div>
    </v-card>
</template>

<script>
export default {
  props: ["painting", "collection"],

  computed: {
    src() {
      if (!this.collection) {
        return `${process.env.VUE_APP_GWEI_ENDPOINT}/?width=300&height=300&text=${encodeURIComponent(this.painting.text)}&inspiration=${this.painting.inspiration}&useRandom=${this.painting.useRandom}&probability=${this.painting.probability}&wallType=${this.painting.place}&overlay=${this.painting.overlay}&overlayOpacity=${this.painting.overlayOpacity}`;
      } else {
        return this.painting.previewImage;
      }
    },
  }
};
</script>
