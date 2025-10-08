module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.plugins = (webpackConfig.plugins || []).filter(p => p.constructor?.name !== "ESLintWebpackPlugin");
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.plugins = (webpackConfig.resolve.plugins || []).filter(p => p.constructor?.name !== "ModuleScopePlugin");
      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/"),
        util: require.resolve("util/"),
        assert: require.resolve("assert/"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify/browser"),
        url: require.resolve("url/"),
        path: require.resolve("path-browserify")
      };
      webpackConfig.module = webpackConfig.module || {};
      webpackConfig.module.rules = webpackConfig.module.rules || [];
      webpackConfig.module.rules.push({ test: /\.m?js$/, resolve: { fullySpecified: false }});
      return webpackConfig;
    }
  },
  typescript: { enableTypeChecking: false }
};
