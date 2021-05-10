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
  props: ["ticks", "text", "inspiration", "useRandom", "wallType", "probability", "size"],

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
      return `${process.env.VUE_APP_GWEI_ENDPOINT}/?width=300&height=300&ticks=${this.ticks}&text=${encodeURIComponent(this.text)}&inspiration=${this.inspiration}&useRandom=${this.useRandom}&probability=${this.probability}&wallType=${this.wallType}`;
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
