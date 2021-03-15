// https://cli.vuejs.org/guide/css.html#passing-options-to-pre-processor-loaders
const { argv } = require("yargs");
const webpack = require("webpack");

const appUrls = {
  dev: "http://local.test/graphql",
  proxy: "https://devcore.app/graphql",
  prod: "https://devcore.app/graphql"
};

module.exports = {
  publicPath: process.env.VUE_APP_SUBFOLDER || "/",
  lintOnSave: false,
  devServer: {
    proxy: "http://local.test",
    watchOptions: {
      clientLogLevel: "warning"
    }
  },
  outputDir: "../devcore_server_lavarel/public/frontend",
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: true
    },
    webpackBundleAnalyzer: {
      //true to analyse build size
      openAnalyzer: false
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

  chainWebpack: config => {
    console.log(process.env.NODE_ENV);

    if (process.env.NODE_ENV !== "production") {
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
    } else {
      // mutate for production...
      config.optimization.minimizer("terser").tap(args => {
        const { terserOptions } = args[0];
        terserOptions.compress["drop_console"] = false;
        terserOptions.compress["dead_code"] = true;
        terserOptions["ecma"] = 6;

        return args;
      });
      config.plugin("define").tap(options => {
        options[0][
          "process.env"
        ].VUE_APP_GRAPHQL_ENDPOINT = `'${appUrls.prod}'`;
        return options;
      });
    }
  }
};
