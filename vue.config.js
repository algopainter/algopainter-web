module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: "@import '~@/assets/scss/vuetify/variables'"
      },
      scss: {
        prependData: "@import '~@/assets/scss/vuetify/variables';"
      }
    }
  },

  // https://cli.vuejs.org/config/#transpiledependencies
  transpileDependencies: ["vuetify"],

  configureWebpack: config => {
    config.module.rules = [
      {
        test: /\.worker\.js$/i,
        use: [
          {
            loader: "comlink-loader",
            options: {
              singleton: true
            }
          }
        ]
      },
      ...config.module.rules
    ];
  },

  devServer: {
    disableHostCheck: true
  }
};
