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

      // Oculta warnings de source map faltante vindos de dependências específicas.
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        /Failed to parse source map/i
      ];

      // Remove html2pdf.js do alcance do source-map-loader para evitar warnings.
      webpackConfig.module.rules
        .filter(rule => rule && rule.enforce === "pre" && Array.isArray(rule.use))
        .forEach(rule => {
          if (rule.use.some(loader => typeof loader === "string" ? loader.includes("source-map-loader") : loader?.loader?.includes("source-map-loader"))) {
            const existingExclude = rule.exclude;
            const html2pdfPattern = /html2pdf\.js/;
            if (Array.isArray(existingExclude)) {
              if (!existingExclude.some(pattern => pattern?.toString() === html2pdfPattern.toString())) {
                rule.exclude = [...existingExclude, html2pdfPattern];
              }
            } else if (existingExclude) {
              rule.exclude = [existingExclude, html2pdfPattern];
            } else {
              rule.exclude = [html2pdfPattern];
            }
          }
        });
      return webpackConfig;
    }
  },
  typescript: { enableTypeChecking: false }
};
