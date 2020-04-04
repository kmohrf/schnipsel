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
  // 2 x app is intentional as django collectstatic will otherwise merge
  // the directory without the app prefix
  outputDir: '../build/app/app',
  devServer: {
    proxy: proxyTarget !== 'disable' ? {
      '/api/': proxyOptions,
      '/api-auth/': proxyOptions,
      '/auth/': proxyOptions,
      '/media/': proxyOptions,
      '/static/': proxyOptions
    } : null
  }
}
