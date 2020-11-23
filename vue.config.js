// https://cli.vuejs.org/guide/css.html#passing-options-to-pre-processor-loaders
const { argv } = require("yargs");
const webpack = require("webpack");

const appUrls = {
  dev: "http://local.test/graphql",
  proxy: "https://devcore.app/graphql",
  prod: "https://devcore.app/graphql"
};

module.exports = {
  //publicPath: process.env.VUE_APP_SUBFOLDER || "/",
  lintOnSave: false,
  outputDir: "../wwwroot",
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: true
    }
  },
  configureWebpack: {
    devtool: "source-map",
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          ...process.env,
          VUE_APP_VERSION: `"${require("./package.json").version}"`
        }
      })
    ]
  },
  css: {
    loaderOptions: {
      scss: {
        prependData: `
          @import "@/scss/_variables.scss";
          @import "@/scss/_fonts.scss";
          @import "@/scss/_medias.scss";
          @import "@/scss/_mixins.scss";
        `
      }
    }
  },
  devServer: {
    watchOptions: {
      clientLogLevel: "warning"
    },
  },

  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // mutate config for production...
    } else {
      // mutate for development...
      // config.module
      // .rule("graphql")
      // .test(/\.graphql$/)
      // .use("graphql-tag/loader")
      // .loader("graphql-tag/loader")
      // .end();

      config.plugin("define").tap(options => {
          // mutate for development...
          if (argv.mode === "proxy") {
            options[0][
              "process.env"
            ].VUE_APP_GRAPHQL_ENDPOINT = `'${appUrls.proxy}'`;
            return options;
          }
          if (argv.mode === "dev") {
            options[0][
              "process.env"
            ].VUE_APP_GRAPHQL_ENDPOINT = `'${appUrls.dev}'`;
            return options;
          }
      });
    }
  }
};
