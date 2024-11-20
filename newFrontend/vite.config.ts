import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import eslintPlugin from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      protocolImports: true,
    }),
    svgr({
      svgrOptions: {
        icon: false,
      },
      include: '**/*.svg?react',
    }),
    react(),
    eslintPlugin({
      // 配置
      cache: false, // 禁用 eslint 缓存
      emitWarning: false, // warning不发出
      emitError: false,
    }),
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      polyfills: ['es.promise.finally', 'es/map', 'es/set'],
    }),
  ],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    target: 'es2015',
    outDir: 'build',
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 3072,
    sourcemap: 'hidden',
  },
  base: '/',
  resolve: {
    alias: {
      '@': '/src/',
      '@assets': '/src/assets/',
      _styles: '/src/styles',
      _theme: '/src/styles/theme',
      _size: '/src/styles/size',
    },
  },
  server: {
    port: 3003,
    // TODO: devServer confit
    open: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]_[local]_[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        quietDeps: true,
        additionalData: '@use "sass:math";\n$quiet-deps: true;',
        logger: {
          warn: () => {}, // 忽略所有警告
        },
        warnRuleAsDeprecated: false, // 关闭废弃警告
      },
    },
    postcss: './postcss.config.js',
  },
});
