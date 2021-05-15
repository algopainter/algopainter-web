<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <div v-on="on" v-bind="attrs">
        <v-alert v-if="isLoading" outlined color="primary" prominent>
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          The AlgoPainter is working for you, wait a moment!
        </v-alert>
        <v-img v-show="loaded"
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
  props: ["ticks", "text", "inspiration", "useRandom", "wallType", "probability", "size", "overlay", "overlayOpacity"],

  data() {
    return {
      isLoading: true,
      loaded: false,
    };
  },

  computed: {
    width() {
      return this.size || 350;
    },

    src() {
      return `${process.env.VUE_APP_GWEI_ENDPOINT}/?width=300&height=300&ticks=${this.ticks}&text=${encodeURIComponent(this.text)}&inspiration=${this.inspiration}&useRandom=${this.useRandom}&probability=${this.probability}&wallType=${this.wallType}&overlay=${this.overlay}&overlayOpacity=${this.overlayOpacity}`;
    }
  },

  mounted() {
    this.loaded = false
  },

  watch: {
    src() {
      this.isLoading = true;
      this.loaded = false;
    },
  },

  methods: {
    load() {
      this.isLoading = false;
      this.loaded = true;
    },
  },
};
</script>
