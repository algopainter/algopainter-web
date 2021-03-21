<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <div v-on="on" v-bind="attrs">
        <v-alert v-if="isLoading" outlined type="info" prominent>
          The AlgoPainter is working for you, wait a moment! :D
        </v-alert>
        <v-skeleton-loader
          v-if="isLoading" 
          class="mx-auto"
          :max-width="size"
          type="image"
        ></v-skeleton-loader>
        <v-img
          class="mx-auto"
          :width="width"
          :src="src"
          @load="load"
        ></v-img>
      </div>
    </template>
  </v-tooltip>
</template>

<script>
export default {
  props: ["ticks", "text", "createBackgroundMosaic", "inspiration", "useWall", "useRandom", "probability", "size"],

  data() {
    return {
      isLoading: true,
    };
  },

  computed: {
    width() {
      return this.size || 350;
    },

    src() {
      return `https://ms-algopainter-gwei.herokuapp.com/?ticks=${this.ticks}&text=${encodeURIComponent(this.text)}&createBackgroundMosaic=${this.createBackgroundMosaic}&inspiration=${this.inspiration}&useWall=${this.useWall}&useRandom=${this.useRandom}&probability=${this.probability}`;
    }
  },

  mounted() {
  },

  watch: {
    src() {
      this.isLoading = true;
    },
  },

  methods: {
    load() {
      this.isLoading = false;
    },
  },
};
</script>
