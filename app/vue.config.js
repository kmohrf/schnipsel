const proxyTarget = process.env.PROXY_TARGET || (process.env.VUE_APP_APIORIGIN ? 'disable' : 'http://localhost:8000/')
const proxyOptions = {
  target: proxyTarget,
  changeOrigin: true,
  toProxy: true,
  protocolRewrite: true,
  autoRewrite: true
}

module.exports = {
  integrity: true,
  parallel: false,
  outputDir: '../build/app',
  devServer: {
    proxy: proxyTarget !== 'disable' ? {
      '/api/': proxyOptions,
      '/api-auth/': proxyOptions,
      '/auth/': proxyOptions,
      '/media/': proxyOptions,
      '/static/': proxyOptions
    } : null
  },
  pwa: {
    name: 'Schnipsel',
    themeColor: '#7957d5',
    msTileColor: '#7957d5',
    manifestOptions: {
      orientation: 'portrait',
      categories: ['productivity']
    },
    iconPaths: {
      favicon32: 'favicon.png',
      favicon16: 'favicon-16.png',
    },
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      importWorkboxFrom: 'local',
      swSrc: 'src/service-worker.js'
    }
  }
}
