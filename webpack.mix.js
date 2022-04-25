const mix = require('laravel-mix')
const { externals, resolve, plugins } = require('./webpack.config.js')

mix.webpackConfig({
  externals,
  resolve,
  plugins,
  // stats: {
  //   children: true // Show child compilation errors (e.g., those from Tailwind)
  // },
  output: {
    chunkFilename: mix.inProduction() ? 'js/[name].[chunkhash].js' : 'js/[name].js',
    publicPath: mix.inProduction() ? '/' : 'http://127.0.0.1:8080/'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: "sass-loader",
        options: {
          additionalData: `
          @import "#/partials/_vars.scss";
          @import "#/partials/_mixins.scss";
          `
        }
      }
    ]
  },
  devServer: {
    port: 8080,
    proxy: {
      '/': 'http://127.0.0.1:8000/'
    }
  }
})

mix.setResourceRoot('./')

mix.copy('resources/assets/img', 'public/img')
  .copy('node_modules/font-awesome/fonts', 'public/fonts')

mix.ts('resources/assets/js/app.ts', 'public/js').vue({ version: 3 })
  .sass('resources/assets/sass/app.scss', 'public/css')
  .ts('resources/assets/js/remote/app.ts', 'public/js/remote').vue({ version: 3 })
  .sass('resources/assets/sass/remote.scss', 'public/css')

if (mix.inProduction()) {
  mix.version()
  mix.disableNotifications()
}
