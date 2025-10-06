module.exports = {
  webpack: {
    configure: (config) => {
      // Remover ESLint para evitar warnings
      config.plugins = (config.plugins || []).filter(
        p => p.constructor?.name !== "ESLintWebpackPlugin"
      );

      // Remover ModuleScopePlugin para permitir imports mais flexíveis
      config.resolve.plugins = (config.resolve?.plugins || []).filter(
        p => p.constructor?.name !== "ModuleScopePlugin"
      );

      // Polyfills necessários, mas SEM 'process'
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        path: require.resolve("path-browserify"),
        buffer: require.resolve("buffer/")
      };

      // Permite imports sem extensão .js
      config.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      });

      return config;
    }
  },
  // Desabilitar type-check no build
  typescript: { enableTypeChecking: false }
};

