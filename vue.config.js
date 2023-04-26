// vue.config.js
module.exports = {
  pwa: {
    workboxOptions: {
      skipWaiting: false
    }
  },
  // options...
  devServer: {
    proxy: process.env.NODE_ENV === 'production'
      ? 'https://intranet.aliplast.com/webapi/'
      : 'https://intranet.aliplast.com/webapi_acc/'
  },
  pluginOptions: {
    i18n: {
      locale: 'nl',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/sfa/'
    : '/sfa_acc/'
}
