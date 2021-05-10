<template>
  <v-card class="mx-auto" min-height="250">
    <v-card-title>
        <div 
        class="d-inline-block text-truncate"
        style="max-width: 250px;">
        #{{ painting.response.tokenId }}
        {{ painting.response.text }}
        </div>
    </v-card-title>

    <v-img height="300" :src="src"></v-img>
    <v-card-text>
        <small class="d-inline-block text-truncate"
        style="max-width: 250px;">
        {{ painting.response.description }}
        </small>
    </v-card-text>

    <v-divider></v-divider>
        <div class="d-flex">
        <v-btn :to="`/paintings/${painting.response.tokenId}`" class="flex-grow-1" tile height="48" text>
            <v-icon left>mdi-share-all</v-icon>
            View
        </v-btn>
        </div>
    </v-card>
</template>

<script>
export default {
  props: ["painting"],

  computed: {
    src() {
      return `${process.env.VUE_APP_GWEI_ENDPOINT}/?text=${encodeURIComponent(this.painting.response.text)}&inspiration=${this.painting.response.inspiration}&useRandom=${this.painting.response.useRandom}&probability=${this.painting.response.probability}&wallType=${this.painting.response.place}`;
    },
  }

};
</script>
